import { TeeTime, validateTeeTime } from '../models/TeeTime';
import { logError, logEvent } from '../utils/logger';

const API_BASE_URL = 'https://api.ansimgolf.com/v1';

interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

export async function fetchTeeTimes(): Promise<TeeTime[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/teetimes`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const json = (await response.json()) as APIResponse<unknown[]>;
    
    if (!json.success || !Array.isArray(json.data)) {
      throw new Error("Invalid API response format");
    }

    // 데이터 검증 및 필터링 (유효한 데이터만 반환)
    const validTeeTimes = json.data
      .map((item: unknown) => validateTeeTime(item))
      .filter((result) => result.success)
      .map((result) => result.data as TeeTime);

    logEvent('fetch_teetimes_success', { count: validTeeTimes.length });
    return validTeeTimes;
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Unknown fetch error'), 'BookingService');
    throw error;
  }
}
