import { TeeTime } from '../models/TeeTime';
import { logEvent } from '../utils/logger';
import { mockTeeTimes } from '../mocks/mockTeeTimes';

// Mock 데이터 사용 여부 (환경 변수로 제어 가능)
const USE_MOCK_DATA = true;

const API_BASE_URL = '/api';

export async function fetchTeeTimes(): Promise<TeeTime[]> {
  // Mock 데이터 사용 시
  if (USE_MOCK_DATA) {
    // 실제 API 호출처럼 약간의 딜레이 추가
    await new Promise((resolve) => setTimeout(resolve, 300));
    logEvent('fetch_teetimes_success', { count: mockTeeTimes.length, source: 'mock' });
    return mockTeeTimes;
  }

  // 실제 API 호출 (추후 활성화)
  const response = await fetch(`${API_BASE_URL}/teetimes`);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = (await response.json()) as TeeTime[];
  logEvent('fetch_teetimes_success', { count: data.length, source: 'api' });
  return data;
}
