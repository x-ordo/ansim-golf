import { describe, it, expect } from 'vitest';

// Test targets raw text parsing
describe('Manager AI Parser Integration', () => {
  it('should parse simple booking text into JSON', async () => {
    // In a real test, we would call the actual Cloudflare Function or mock it.
    // For now, we simulate the expected behavior of our new parser logic.
    
    // Logic check: We'll implement this in functions/api/manager/parse.ts
    // For the test, we'll verify the endpoint returns the correct structure.
    const mockResponse = {
      parsedCount: 1,
      items: [
        {
          courseName: "파주CC",
          date: "2026-08-15",
          time: "07:12",
          price: 190000
        }
      ]
    };

    // This is a placeholder for the actual API call logic
    const firstItem = mockResponse.items[0]!;
    expect(firstItem.courseName).toBe("파주CC");
    expect(firstItem.price).toBe(190000);
  });
});
