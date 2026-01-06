
import { GoogleGenAI } from "@google/genai";

interface Env {
  GEMINI_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const request = context.request;
  const env = context.env;

  // Handle CORS (Pages handles OPTIONS automatically usually, but let's be safe)
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    const body = await request.json() as any;
    const history = body.history || [];

    if (!env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "API Key not configured on server" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    const model = ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: history.map((msg: any) => ({
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
    const text = response.text || "죄송합니다. 응답을 생성할 수 없습니다.";

    return new Response(JSON.stringify({ text }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
