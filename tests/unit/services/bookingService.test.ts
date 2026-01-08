import { describe, it, expect } from 'vitest';
import { fetchTeeTimes } from '../../../src/services/bookingService';

describe('BookingService', () => {
  it('should fetch tee times successfully', async () => {
    const teeTimes = await fetchTeeTimes();

    expect(teeTimes).toHaveLength(1);
    const firstTeeTime = teeTimes[0]!;
    expect(firstTeeTime.price).toBe(250000);
    expect(firstTeeTime.status).toBe('AVAILABLE');
  });
});
