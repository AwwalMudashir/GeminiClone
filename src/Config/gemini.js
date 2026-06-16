// node --version # Should be >= 18
// npm install @google/generative-ai

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai"

const MODEL_NAME = "gemini-3.5-flash";
const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  throw new Error("Missing VITE_API_KEY in environment variables. Add it to .env.local at the project root.");
}

async function runChat(prompt) {
  const genAI = new GoogleGenerativeAI(API_KEY);

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig,
    safetySettings,
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  console.log(response.text());
  return response.text();
}

export default runChat;