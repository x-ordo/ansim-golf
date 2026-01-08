import { GoogleGenerativeAI } from "@google/genai";

// Cloudflare Workers Environment Interface
interface Env {
  GEMINI_API_KEY: string;
}

// Request Body Interface
interface ChatRequest {
  message: string;
  history?: { role: 'user' | 'model'; text: string }[];
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // 1. Security Check: API Key Existence
  if (!env.GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: "Server Configuration Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // 2. Parse Request
    const body: ChatRequest = await request.json();
    if (!body.message) {
      return new Response(JSON.stringify({ error: "Message is required" }), { status: 400 });
    }

    // 3. TODO: Fetch Available TeeTimes (Simulated Context)
    // In real implementation, fetch from D1 or upstream API
    const contextData = [
      { id: '1', name: '파주CC', time: '08:30', price: 250000 },
      { id: '2', name: '남양주CC', time: '14:00', price: 180000 }
    ];

    // 4. Construct Prompt with Context
    const systemPrompt = `
      Role: Ansim Golf AI Manager (안심이)
      
      Task:
      1. Analyze user's intent [Region, Date, Time, Price, Type].
      2. Find matching tee times from the CONTEXT below.
      3. Respond ONLY in the following JSON format (no markdown):
      
      {
        "text": "Friendly response explaining the recommendation.",
        "recommendedIds": ["id-from-context"]
      }
      
      CONTEXT (Available TeeTimes):
      ${JSON.stringify(contextData)}
      
      Rules:
      - NEVER invent tee times not in CONTEXT.
      - If no match, set "recommendedIds": [] and apologize politely.
      - For casual greetings, set "recommendedIds": [].
    `;

    // 5. Call Gemini API (Pseudo-code until SDK integrated)
    // const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    // const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    // ...

    return new Response(JSON.stringify({ 
      role: 'model',
      text: `(Echo) ${body.message} - API Key Verified. Logic Pending.` 
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};