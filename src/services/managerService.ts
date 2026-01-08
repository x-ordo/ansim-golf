export interface ParsedBooking {
  courseName: string;
  date: string;
  time: string;
  price: number;
  type: string;
}

export interface ParseResponse {
  parsedCount: number;
  items: ParsedBooking[];
}

export async function parseBookingText(rawText: string): Promise<ParseResponse> {
  const response = await fetch('/api/manager/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawText }),
  });

  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error || 'Parsing failed');
  }

  return response.json();
}
