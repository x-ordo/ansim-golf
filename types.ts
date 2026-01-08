
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
  distanceKm?: number;
  address?: string;
  
  // GMS 상세 정보
  holesCount: number;
  parTotal: number;
  totalDistance: number;
  courseRating?: number;
  operatingHours?: string;
}

export interface Member {
  id: string;
  name: string;
  rank: 'VVIP' | 'GOLD' | 'GENERAL' | 'PARTNER';
  phone: string;
  joinDate: string;
  noShowCount: number;
  totalSpent: number;
}

export interface Statistics {
  occupancyRate: number; 
  revenue: number;       
  cancelledCount: number; 
  dumpingSales: number;  
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
  
  // SaaS/GMS 상태
  status: 'AVAILABLE' | 'DEPOSIT_PENDING' | 'CONFIRMED' | 'NOSHOW_CLAIMED' | 'DUMPED';
  billingKeySecured: boolean; 
  
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
