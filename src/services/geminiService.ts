import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || '';

export const generateAIContent = async (modelName: string, prompt: string, temperature: number = 0.7) => {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Please configure it in the Secrets panel.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: modelName,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      temperature,
    },
  });

  return response.text || '';
};
