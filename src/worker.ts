
import { GoogleGenAI } from "@google/genai";

interface Env {
	GEMINI_API_KEY: string;
}

export default {
	async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		// 1. API 요청 처리 (백엔드)
		if (url.pathname.startsWith("/api/")) {
			// Handle CORS Preflight
			if (request.method === "OPTIONS") {
				return new Response(null, {
					headers: {
						"Access-Control-Allow-Origin": "*",
						"Access-Control-Allow-Methods": "POST, OPTIONS",
						"Access-Control-Allow-Headers": "Content-Type",
					},
				});
			}

			if (request.method === "POST" && url.pathname === "/api/chat") {
				try {
					const body = await request.json() as any;
					const history = body.history || [];

					if (!env.GEMINI_API_KEY) {
						return new Response(JSON.stringify({ error: "API Key not configured on server" }), {
							status: 500,
							headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
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
						headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
					});

				} catch (error: any) {
					return new Response(JSON.stringify({ error: error.message }), {
						status: 500,
						headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
					});
				}
			}
		}

		// 2. 그 외 모든 요청은 프론트엔드(ASSETS)로 전달
		return env.ASSETS.fetch(request);
	},
};
