// node --version # Should be >= 18
// npm install @google/generative-ai

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai"

const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  throw new Error("Missing VITE_API_KEY in environment variables. Add it to .env.local at the project root.");
}

export async function getLatestModels() {
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1/models", {
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    return json?.models?.map(m => m.name).filter(Boolean) || [];
  } catch (error) {
    console.error('Error fetching Gemini models:', error);
    return ["gemini-1.0-pro", "gemini-3.5-flash", "gemini-pro-vision", "models/chat-bison-001"];
  }
}

const MODEL_NAME = "gemini-3.5-flash";

async function runChat(prompt, modelName) {
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

  const modelId = modelName || MODEL_NAME;
  console.log(`Using Gemini model: ${modelId}`);

  const model = genAI.getGenerativeModel({
    model: modelId,
    generationConfig,
    safetySettings,
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  console.log(response.text());
  return response.text();
}

export default runChat;