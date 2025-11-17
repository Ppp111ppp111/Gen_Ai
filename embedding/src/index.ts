import OpenAI from "openai";
import dotenv from "dotenv";
import { join } from "path";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Load .env variables
dotenv.config();
// Fix: __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Fruite = {
  id: string;
  name: string;
  description: string;
}
// -------------------------------
function loadJson<T>(fileName: string): T {
  const filePath = join(__dirname, fileName);
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}
// -------------------------------
async function run() {
const fruite: Fruite[] = loadJson<Fruite[]>("fruite.json");
const fruiteDescription = fruite.map((f) => f.description);
console.log(fruiteDescription);
}
run();