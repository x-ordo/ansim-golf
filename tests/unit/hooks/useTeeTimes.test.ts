import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useTeeTimes } from '../../../src/hooks/useTeeTimes';
import * as bookingService from '../../../src/services/bookingService';

// Mocking Service
vi.mock('../../../src/services/bookingService', () => ({
  fetchTeeTimes: vi.fn(),
}));

describe('useTeeTimes', () => {
  it('should return data after loading', async () => {
    // Given
    const mockData = [{ id: '1', price: 100000, status: 'AVAILABLE' }];
    (bookingService.fetchTeeTimes as any).mockResolvedValue(mockData);

    // When
    const { result } = renderHook(() => useTeeTimes());

    // Then (Initial State)
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);

    // Then (After Async)
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('should handle error', async () => {
    // Given
    (bookingService.fetchTeeTimes as any).mockRejectedValue(new Error('Network Error'));

    // When
    const { result } = renderHook(() => useTeeTimes());

    // Then
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network Error');
  });
});
