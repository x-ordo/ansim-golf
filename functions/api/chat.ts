
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
        규칙 4. 하이브리드 결제: 
          - "그린피는 매니저 계좌로 직접 입금하시되, 노쇼 방지를 위해 카드 등록(빌링키)이 필수입니다."
          - "노쇼가 아니면 카드에서 비용이 차감되지 않으니 안심하세요."
        규칙 5. 파트너 SaaS:
          - "매니저님은 엑셀/카톡 텍스트를 복사해 대시보드에 붙여넣기만 하면 자동 등록됩니다."
          - "입금 확인 버튼 하나로 고객에게 알림톡이 자동 발송됩니다."

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
