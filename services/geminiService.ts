import { ChatMessage } from "../types";

export const generateGolfAdvice = async (history: ChatMessage[]): Promise<string> => {
  try {
    // Call the Cloudflare Worker backend
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ history }),
    });

    if (!response.ok) {
      const errorData = await response.json() as any;
      throw new Error(errorData.error || 'Network response was not ok');
    }

    const data = await response.json() as any;
    return data.text;
  } catch (error) {
    console.error("AI Chat Error:", error);
    return "죄송합니다. 서버 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
};

export const extractTeeTimeInfo = async (unstructuredText: string) => {
  // TODO: Implement backend endpoint for extraction if needed
  return "Currently migrating to backend...";
};
