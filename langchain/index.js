import 'dotenv/config';
import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts"; // <--- NEW IMPORT

const model = new ChatOpenAI({ 
  modelName: "gpt-3.5-turbo",
  temperature: 0.7,
});

// 1. Create the Prompt Template
// We use {dish} as a placeholder variable
const prompt = ChatPromptTemplate.fromTemplate("trancelet this text  into this language: {text}:{language}");

const parser = new StringOutputParser();

// 2. Update the Chain
// The sequence is now: Prompt -> Model -> Parser
const chain = prompt.pipe(model).pipe(parser);

// 3. Invoke with Data
// We pass an object matching the variable name in the template
const response = await chain.invoke({text:"Hello, how are you?", language:"bengali"
   });

console.log(response);
