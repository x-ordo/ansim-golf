interface Env {
  GEMINI_API_KEY: string;
  DB: D1Database;
}

interface ChatRequest {
  message: string;
  history?: { role: 'user' | 'model'; text: string }[];
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (!env.GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: "Server Configuration Error: Missing API Key" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const body: ChatRequest = await request.json();
    if (!body.message) {
      return new Response(JSON.stringify({ error: "Message is required" }), { status: 400 });
    }

    // 1. Fetch Context Data from D1 Database
    // Join TeeTime with GolfCourse to get readable names
    const query = `
      SELECT 
        t.id, 
        c.name as name, 
        t.date, 
        t.time, 
        t.price, 
        c.region 
      FROM tee_times t
      JOIN golf_courses c ON t.course_id = c.id
      WHERE t.status = 'AVAILABLE'
      AND t.date >= date('now')
      ORDER BY t.date ASC, t.time ASC
      LIMIT 20
    `;
    
    const { results } = await env.DB.prepare(query).all();
    const contextData = results; // Use real DB results

    // 2. Construct System Prompt
    const systemInstruction = `
      Role: Ansim Golf AI Manager (안심이).
      Task: Recommend tee times from CONTEXT based on user intent.
      Constraint:
      - Respond ONLY in JSON format.
      - JSON Schema: { "text": string, "recommendedIds": string[] }
      - If no match, "recommendedIds": [].
      
      CONTEXT:
      ${JSON.stringify(contextData)}
    `;

    // 3. Call Gemini API (REST)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
    
    const payload = {
      contents: [
        { role: 'user', parts: [{ text: systemInstruction }] }, // System prompt as first user msg for simple context
        ...((body.history || []).map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }))),
        { role: 'user', parts: [{ text: body.message }] }
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    };

    const apiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`Gemini API Error: ${apiResponse.status} - ${errorText}`);
    }

    const data = await apiResponse.json() as any;
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error("No response from AI");
    }

    // 4. Parse JSON Response from AI
    let parsedResponse: { text: string, recommendedIds: string[] };
    try {
      parsedResponse = JSON.parse(generatedText);
    } catch (e) {
      // Fallback if AI fails to output JSON
      parsedResponse = { text: generatedText, recommendedIds: [] };
    }

    return new Response(JSON.stringify({
      role: 'model',
      text: parsedResponse.text,
      recommendedIds: parsedResponse.recommendedIds
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err: any) {
    console.error("Chat Error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" } 
    });
  }
};
