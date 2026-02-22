
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGeminiResponse = async (
  message: string, 
  history: { role: string, parts: { text: string }[] }[],
  systemInstruction: string = "You are a helpful and friendly assistant integrated into a WhatsApp clone. Keep your responses concise and conversational."
) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingBudget: 32768
        }
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to my brain right now. Please try again!";
  }
};
