
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
        systemInstruction: `You are the '안심골프 AI 컨시어지' (Ansim Golf AI Concierge), a professional golf booking assistant.
        
        Your Mission:
        1. Explain the 'Escrow System': Users pay via platform, money is held until check-in. This prevents scams.
        2. Explain 'No-Show Protection': We use Billing Keys to charge liquidated damages to those who cancel last minute.
        3. Explain 'KFTC Compliance': 100% refund for cancellations 4 days prior, as per Fair Trade Commission standards.
        4. Promote 'Partner SaaS': Our inventory comes from certified partners using our SaaS tools.
        
        Style: Professional, trustworthy, and helpful. Use Korean. 
        Focus on 'Security', 'Transparency', and 'Legal Compliance' under the 'Ansim Golf' brand.`
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
