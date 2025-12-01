import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SerpAPI } from "@langchain/community/tools/serpapi";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph"; 
import { HumanMessage } from "@langchain/core/messages";
import dotenv from "dotenv";
dotenv.config();


const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
  apiKey: process.env.GOOGLE_API_KEY,
});

const searchTool = new SerpAPI(process.env.SERPAPI_API_KEY);
const tools = [searchTool];

const systemPrompt = `You are an elite investigative tech journalist named "Gemini News". 
Your style is concise, professional, and fact-based.
- ALWAYS use the Search Tool to verify facts. Never hallucinate news.
- When the user asks a follow-up question, use your memory of the previous search.
- If the user asks about something unrelated to news, politely steer them back to current events.`;


const checkpointer = new MemorySaver();


const agent = createReactAgent({
  llm,
  tools,
  checkpointSaver: checkpointer, 
  stateModifier: systemPrompt, 
});


async function chatWithAgent(message, threadId) {
  
  const config = { configurable: { thread_id: threadId } };

  console.log(` USER: ${message}`);
  
  const response = await agent.invoke(
    { messages: [new HumanMessage(message)] },
    config
  );

  console.log(`AGENT: ${response.messages[response.messages.length - 1].content}`);
}

// --- Execution ---
async function run() {
  const threadId = "user-session-123"; // Unique ID for this specific conversation

  // Turn 1: Initial Query
  await chatWithAgent("What is the latest news about OpenAI?", threadId);

  // Turn 2: Follow-up (Tests Memory)
  
  await chatWithAgent("Have they released any new models recently?", threadId);
}

run().catch(console.error);