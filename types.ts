
export enum BookingType {
  TRANSFER = '양도',
  JOIN = '조인',
  SPECIAL = '특가'
}

export interface GolfCourse {
  id: string;
  name: string;
  location: string;
  region: 'SUDOKWON_SOUTH' | 'SUDOKWON_NORTH' | 'CHUNGCHEONG' | 'GANGWON' | 'ETC';
  image: string;
}

export interface Manager {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
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
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
