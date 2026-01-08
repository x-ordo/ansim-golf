import { describe, it, expect } from 'vitest';
import { fetchTeeTimes } from '../../../src/services/bookingService';

describe('BookingService', () => {
  it('should fetch tee times successfully', async () => {
    const teeTimes = await fetchTeeTimes();

    // Mock 데이터는 6개의 티타임을 반환함
    expect(teeTimes.length).toBeGreaterThan(0);
    const firstTeeTime = teeTimes[0]!;
    expect(firstTeeTime.status).toBe('AVAILABLE');
    expect(firstTeeTime.course).toBeDefined();
    expect(firstTeeTime.manager).toBeDefined();
  });
});
