import { describe, it, expect } from 'vitest';
import { formatKRW } from '../../../src/utils/formatters';

describe('formatKRW', () => {
  it('should format number to KRW string with comma', () => {
    // Given
    const amount = 210000;
    
    // When
    const result = formatKRW(amount);
    
    // Then
    expect(result).toBe('210,000원');
  });

  it('should handle zero', () => {
    expect(formatKRW(0)).toBe('0원');
  });
});
