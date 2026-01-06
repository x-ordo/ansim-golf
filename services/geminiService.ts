
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateGolfAdvice = async (history: ChatMessage[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key 설정을 해주세요. (Gemini API Key가 필요합니다)";
  }

  const model = ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: history.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    })),
    config: {
      systemInstruction: `You are '안심골프 AI', a professional golf booking assistant. 
      You help users find the best tee times, explain the benefits of escrow payments, 
      and provide advice on Korean golf courses (like region specialties, difficulty). 
      Keep your answers helpful, concise, and in Korean. 
      Promote 'Trust' and 'Security' of our platform.`
    }
  });

  const response = await model;
  return response.text || "죄송합니다. 메시지를 처리하는 중에 오류가 발생했습니다.";
};

export const extractTeeTimeInfo = async (unstructuredText: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Extract golf booking info from this text: "${unstructuredText}". 
    Return as JSON with: courseName, region, date, time, price, slotsRemaining.`,
    config: {
      responseMimeType: "application/json"
    }
  });
  return response.text;
};
