
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
    
    // [로깅] 사용자 입력 기록
    console.log(`[AI_REQUEST] Time: ${new Date().toISOString()}, HistoryLength: ${history.length}`);

    const model = ai.models.generateContent({
      // ... (contents and config inside)
      model: 'gemini-1.5-flash',
      contents: history.map((msg: any) => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      })),
      config: {
        // [알고리즘 제어 1] 일관성을 위해 낮은 민감도(Temperature) 설정
        temperature: 0.1, 
        maxOutputTokens: 500,
        
        // [알고리즘 제어 2] 결정 트리 방식의 시스템 지침
        systemInstruction: `당신은 안심골프의 '알고리즘 가이드'입니다. 자의적 판단을 배제하고 아래 규칙(Decision Tree)에 따라서만 응답하십시오.

        규칙 1. 접근 제어: 가격 협상이나 예약 확정은 직접 수행할 수 없습니다. "매니저와 대화하기" 버튼을 이용하도록 안내하십시오.
        규칙 2. 기능 제한: 골프 부킹 외의 일상 대화, 정치, 경제 등 외부 질문에는 "부킹 관련 상담만 가능합니다"라고 답변을 제한하십시오.
        규칙 3. 환불 로직: 
          - 4일 전 취소: 100% 환불
          - 2~3일 전: 10% 차감
          - 1일 전: 20% 차감
          - 당일: 매니저 협의 필요 (공정위 표준약관 기반)
        규칙 4. 에스크로 설명: "대금은 안심골프가 보관하며, 라운드 종료 후 매니저에게 정산됩니다"라는 문구를 고수하십시오.

        모든 답변은 한국어로, 짧고 단정하게(Short & Concise) 제공하십시오.`
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
