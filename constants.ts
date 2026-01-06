import { BookingType, TeeTime } from './types';

export const REGIONS = [
  { id: 'ALL', label: '전체' },
  { id: 'SUDOKWON_SOUTH', label: '수도권 남부' },
  { id: 'SUDOKWON_NORTH', label: '수도권 북부' },
  { id: 'CHUNGCHEONG', label: '충청' },
  { id: 'GANGWON', label: '강원' },
  { id: 'THAILAND', label: '태국' },
  { id: 'CHINA', label: '중국' },
  { id: 'JAPAN', label: '일본' },
  { id: 'VIETNAM', label: '베트남' },
];

export const MOCK_TEE_TIMES: TeeTime[] = [
  {
    id: 't1',
    course: {
      id: 'c5',
      name: '하이난 미션힐스',
      location: '중국 하이커우',
      region: 'CHINA',
      image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=1600&auto=format&fit=crop',
      distanceKm: 2150,
    },
    date: '2026-01-07',
    time: '09:51',
    price: 899000,
    originalPrice: 1200000,
    slotsTotal: 72,
    slotsRemaining: 15,
    type: BookingType.FESTA,
    holes: 18,
    caddyType: 'CADDY',
    createdAt: '01/06 22:25',
    manager: {
      id: 'm5',
      name: '지사 공돌이',
      rating: 5.0,
      reviewCount: 5000,
      isVerified: true,
      partnerType: 'PREMIUM',
      company: '골프몬',
      stats: { totalBookings: 4682, favoriteCount: 268 }
    },
    description: '[ALL포함 단독행사] 72인 샷건 티오프 페스타! 3박 4일 풀패키지.',
    escrowEnabled: true,
    refundPolicy: '공정위 표준약관 준수 (4일 전 100% 환불)'
  },
  {
    id: 't2',
    course: {
      id: 'c6',
      name: '파주CC',
      location: '경기 파주',
      region: 'SUDOKWON_NORTH',
      image: 'https://images.unsplash.com/photo-1592919016386-3e0f5c09756b?q=80&w=1600&auto=format&fit=crop',
      distanceKm: 37,
    },
    date: '2026-01-07',
    time: '10:26',
    price: 60000,
    originalPrice: 180000,
    slotsTotal: 4,
    slotsRemaining: 2,
    type: BookingType.JOIN,
    holes: 18,
    caddyType: 'CADDY',
    createdAt: '01/06 22:27',
    manager: {
      id: 'm1',
      name: '효 실짱',
      rating: 4.9,
      reviewCount: 1250,
      isVerified: true,
      partnerType: 'CERTIFIED',
      company: '골프몬',
      stats: { totalBookings: 1250, favoriteCount: 89 }
    },
    description: '[경기북부] 파주CC 2인 조인 가능합니다.',
    escrowEnabled: true,
    refundPolicy: '7일전 정상취소 가능'
  },
  {
    id: 't3',
    course: {
      id: 'c7',
      name: '남양주CC (P9)',
      location: '경기 남양주',
      region: 'SUDOKWON_NORTH',
      image: 'https://images.unsplash.com/photo-1600585154340-be6199f7e009?q=80&w=1600&auto=format&fit=crop',
      distanceKm: 12,
    },
    date: '2026-01-08',
    time: '11:07',
    price: 40000,
    originalPrice: 80000,
    slotsTotal: 4,
    slotsRemaining: 4,
    type: BookingType.TRANSFER,
    holes: 18,
    caddyType: 'NO_CADDY',
    createdAt: '01/06 21:58',
    manager: {
      id: 'm2',
      name: '이지혜 매니저',
      rating: 4.8,
      reviewCount: 3400,
      isVerified: true,
      partnerType: 'GENERAL',
      stats: { totalBookings: 3400, favoriteCount: 156 }
    },
    description: '긴급 양도! 가성비 최고의 노캐디 라운딩.',
    escrowEnabled: true,
    refundPolicy: '당일 취소 불가'
  }
];

export const MOCK_DATE_COUNTS = [
  { date: '2026-01-06', count: 427 },
  { date: '2026-01-07', count: 461 },
  { date: '2026-01-08', count: 528 },
  { date: '2026-01-09', count: 431 },
  { date: '2026-01-10', count: 459 },
  { date: '2026-01-11', count: 288 },
  { date: '2026-01-12', count: 276 },
];