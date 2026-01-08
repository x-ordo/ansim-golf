import { ChatMessage } from '../../types';

export interface ChatResponse {
  role: 'model';
  text: string;
  recommendedIds?: string[];
}

export async function sendMessageToGemini(
  message: string,
  history: ChatMessage[]
): Promise<ChatResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });

  if (!response.ok) {
    const errData = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(errData.error || `Server Error: ${response.status}`);
  }

  return response.json();
}
