import { describe, it, expect } from 'vitest';
import { fetchTeeTimes } from '../../../src/services/bookingService';

describe('BookingService', () => {
  it('should fetch tee times successfully', async () => {
    const teeTimes = await fetchTeeTimes();
    
    expect(teeTimes).toHaveLength(1);
    expect(teeTimes[0].price).toBe(250000);
    expect(teeTimes[0].status).toBe('AVAILABLE');
  });
});
