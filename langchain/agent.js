import 'dotenv/config';
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

// --- 1. Define the Tool ---
const getWeather = tool(
  (input) => {
    // Logic: Check if the city is Tokyo, otherwise return generic sunny weather
    if (input.city.toLowerCase().includes("tokyo")) {
        return "It is raining cats and dogs in Tokyo!";
    }
    return `It's always sunny in ${input.city}!`;
  },
  {
    name: "get_weather",
    description: "Get the weather for a given city",
    schema: z.object({
      city: z.string().describe("The city to get the weather for"),
    }),
  }
);

// --- 2. Configure the Model & Memory ---
const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0, // Precision is good for tool calling
});

const checkpointer = new MemorySaver();

// --- 3. Create the Agent ---
const systemPrompt = "You are a funny weather forecaster who speaks in puns.";

const agent = createReactAgent({
  llm: model,
  tools: [getWeather],
  checkpointSaver: checkpointer,
  stateModifier: systemPrompt,
});

// --- 4. Run the Agent (Simulation) ---
async function runAgent() {
  // Define a unique thread ID to simulate a specific user session
  const config = { configurable: { thread_id: "1" } };

  // --- Turn 1: Asking about Tokyo ---
  console.log("--- Turn 1: User asks about Tokyo ---");
  const response1 = await agent.invoke(
    { messages: [{ role: "user", content: "What's the weather in Tokyo?" }] },
    config
  );
  console.log("Agent:", response1.messages[response1.messages.length - 1].content);

  // --- Turn 2: Asking a follow-up (Testing Memory) ---
  console.log("\n--- Turn 2: User asks a follow-up ---");
  const response2 = await agent.invoke(
    { messages: [{ role: "user", content: "Is it nice there?" }] },
    config 
  );
  console.log("Agent:", response2.messages[response2.messages.length - 1].content);
}

runAgent();