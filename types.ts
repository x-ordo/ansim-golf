// Legacy types are being replaced by src/models/
// Re-exporting from models for backward compatibility
import { z } from 'zod';
import { TeeTimeSchema } from './src/models/TeeTime';

export type TeeTime = z.infer<typeof TeeTimeSchema>;

export interface Manager {
  id: string;
  name: string;
  rank: 'VVIP' | 'GOLD' | 'GENERAL' | 'PARTNER';
  phone: string;
  joinDate: string;
  noShowCount: number;
  totalSpent: number;
  stats?: {
    totalBookings: number;
  };
}

// Re-defining BookingType to match Schema
export enum BookingType {
  TRANSFER = 'TRANSFER',
  JOIN = 'JOIN',
  SPECIAL = 'SPECIAL',
  TOUR = 'TOUR',
  FESTA = 'FESTA'
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
  holesCount: number;
  parTotal?: number;
  totalDistance?: number;
  courseRating?: number;
  operatingHours?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface DateCount {
  date: string;
  count: number;
}

export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assignee: string;
  category: 'GMS' | 'SAAS' | 'FINTECH' | 'B2C';
}

export interface Statistics {
  occupancyRate: number; 
  revenue: number;       
  cancelledCount: number; 
  dumpingSales: number;  
}
