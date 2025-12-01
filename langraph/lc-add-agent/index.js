// index.mjs
import 'dotenv/config';
import { z } from "zod";

import { MessagesAnnotation, StateGraph, START, END } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

//
// 1. DEFINE TOOLS (add, multiply)
//

// Add tool
const addTool = tool(
  ({ a, b }) => {
    return a + b;
  },
  {
    name: "add_numbers",
    description: "Add two numbers a and b.",
    schema: z.object({
      a: z.number().describe("First number"),
      b: z.number().describe("Second number"),
    }),
  }
);

// Multiply tool
const multiplyTool = tool(
  ({ a, b }) => {
    return a * b;
  },
  {
    name: "multiply_numbers",
    description: "Multiply two numbers a and b.",
    schema: z.object({
      a: z.number().describe("First number"),
      b: z.number().describe("Second number"),
    }),
  }
);

const tools = [addTool, multiplyTool];

//
// 2. SETUP GEMINI MODEL AND BIND TOOLS
//
const model = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  apiKey: process.env.GOOGLE_API_KEY,
}).bindTools(tools);

//
// 3. NODE 1: CALL MODEL
//
async function callModel(state) {
  // state has shape: { messages: [...] }
  const response = await model.invoke([
    {
      role: "system",
      content:
        "You are a math assistant. Use tools to correctly compute results. Show steps in your final answer.",
    },
    ...state.messages,
  ]);

  // We must return an updated state object
  return {
    messages: [...state.messages, response],
  };
}

//
// 4. ROUTER: DECIDE WHETHER TO USE TOOLS OR END
//
function routeAfterModel(state) {
  const lastMessage = state.messages[state.messages.length - 1];

  // If model requested any tools, go to "tools" node
  if (lastMessage?.tool_calls && lastMessage.tool_calls.length > 0) {
    return "tools";
  }

  // Otherwise, no tool calls → end the graph
  return "__end__";
}

//
// 5. BUILD GRAPH: NODES + EDGES
//
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("callModel", callModel)
  .addNode("tools", new ToolNode(tools))
  .addEdge(START, "callModel")
  .addConditionalEdges("callModel", routeAfterModel, {
    tools: "tools",
    __end__: END,
  })
  .addEdge("tools", "callModel");

const graph = workflow.compile();

//
// 6. RUN THE AGENT
//
const run = async () => {
  const result = await graph.invoke({
    messages: [
      {
        role: "user",
        content: "First multiply 5 by 3, then add 7 to the result.",
      },
    ],
  });

  console.log("Final messages:");
  console.log(result.messages[result.messages.length - 1].content);
};

run().catch(console.error);
