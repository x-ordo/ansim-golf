
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
  subscription: 'FREE' | 'PRO' | 'PREMIUM'; // 구독 등급 추가
  stats?: {
    totalBookings: number; 
    favoriteCount: number; 
    savedTimeHours?: number; // SaaS로 아낀 시간
  };
  company?: string; 
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
  
  // SaaS 관리 상태
  status: 'AVAILABLE' | 'DEPOSIT_PENDING' | 'CONFIRMED' | 'NOSHOW_CLAIMED';
  billingKeySecured: boolean; // 노쇼 방지 빌링키 확보 여부
  
  holes: 18 | 27 | 36;
  caddyType: 'CADDY' | 'NO_CADDY' | 'DRIVING_CADDY';
  createdAt: string; 
  isEmergency?: boolean; 
  joinRequirements?: {
    gender: 'MALE' | 'FEMALE' | 'ANY' | 'COUPLE';
    count: number;
  };
  isTourPackage?: boolean;
  lodgingInfo?: string;
}

export interface DateCount {
  date: string;
  count: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
