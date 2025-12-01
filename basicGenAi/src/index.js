import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Initialize the Gemini client using the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  // Choose a Gemini model
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  
  const prompt =
    "You are a helpful assistant. Explain the theory of relativity in simple terms in a few sentences.";

  const response = await model.generateContent(prompt);
  const text = response.response.text();

  console.log(text);
}


run().catch(console.error);



