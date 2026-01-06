
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
}

export interface Manager {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  partnerType: 'PREMIUM' | 'CERTIFIED' | 'GENERAL'; // 파트너 등급제
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
  escrowEnabled: boolean; // 에스크로 적용 여부
  refundPolicy: string;   // 공정위 준수 환불 규정 텍스트
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
