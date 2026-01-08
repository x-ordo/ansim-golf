import { describe, it, expect } from 'vitest';
import { validateTeeTime } from '../../../src/models/TeeTime';

describe('TeeTime Model Validation', () => {
  const validTeeTime = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    courseId: '123e4567-e89b-12d3-a456-426614174001',
    date: '2026-05-15',
    time: '08:30',
    price: 250000,
    originalPrice: 300000,
    type: 'JOIN',
    managerId: '123e4567-e89b-12d3-a456-426614174002',
    status: 'AVAILABLE',
    escrowEnabled: true
  };

  it('should pass validation for a valid tee time', () => {
    const result = validateTeeTime(validTeeTime);
    expect(result.success).toBe(true);
  });

  it('should fail when price is negative', () => {
    const invalidData = { ...validTeeTime, price: -5000 };
    const result = validateTeeTime(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('non-negative'); // Zod error message or custom
    }
  });

  it('should fail when date format is invalid', () => {
    const invalidData = { ...validTeeTime, date: '2026/05/15' }; // Wrong separator
    const result = validateTeeTime(invalidData);
    expect(result.success).toBe(false);
  });

  it('should fail when time format is invalid', () => {
    const invalidData = { ...validTeeTime, time: '8:30' }; // Missing padding
    const result = validateTeeTime(invalidData);
    expect(result.success).toBe(false);
  });
});
