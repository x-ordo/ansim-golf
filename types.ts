
export enum BookingType {
  TRANSFER = '양도',
  JOIN = '조인',
  SPECIAL = '특가',
  TOUR = '투어',
  FESTA = '페스타'
}

export enum PaymentStatus {
  PENDING = '결제대기',
  ESCROW_HOLD = '에스크로예치',
  COMPLETED = '정산완료',
  REFUNDED = '환불완료',
  NOSHOW_CLAIM = '위약금청구'
}

export type RegionId = 'ALL' | 'SUDOKWON_SOUTH' | 'SUDOKWON_NORTH' | 'CHUNGCHEONG' | 'GANGWON' | 'THAILAND' | 'CHINA' | 'JAPAN' | 'VIETNAM' | 'ETC';

export interface GolfCourse {
  id: string;
  name: string;
  location: string;
  region: RegionId;
  image: string;
  distanceKm?: number; // 현재 위치로부터의 거리
  address?: string;    // 상세 주소
}

export interface Manager {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  partnerType: 'PREMIUM' | 'CERTIFIED' | 'GENERAL';
  stats?: {
    totalBookings: number; // 누적 완료 건수
    favoriteCount: number; // 즐겨찾기 수
  };
  company?: string; // 소속 지사 (예: 골프몬 본사)
}

export interface TeeTime {
  id: string;
  course: GolfCourse;
  date: string;
  time: string;
  price: number;
  originalPrice: number;
  slotsTotal: number;
  slotsRemaining: number;
  type: BookingType;
  manager: Manager;
  description: string;
  escrowEnabled: boolean;
  refundPolicy: string;
  
  // 골프몬 수준의 추가 메타데이터
  holes: 18 | 27 | 36;
  caddyType: 'CADDY' | 'NO_CADDY' | 'DRIVING_CADDY';
  createdAt: string; // 등록 일시 (예: 01/06 22:25)
  isEmergency?: boolean; // 긴급 매물 여부
}

export interface DateCount {
  date: string;
  count: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
