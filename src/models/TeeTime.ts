import { z } from 'zod';

// Phase 2 DATA_MODEL.md 기반 구현
export const TeeTimeSchema = z.object({
  id: z.string().uuid(),
  courseId: z.string().uuid(),
  course: z.object({
    id: z.string(),
    name: z.string(),
    region: z.string(),
    location: z.string(),
    image: z.string(),
    holesCount: z.number().optional(),
    distanceKm: z.number().optional()
  }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:mm)"),
  price: z.number().nonnegative("Price must be non-negative"),
  originalPrice: z.number().nonnegative("Original price must be non-negative"),
  type: z.enum(['TRANSFER', 'JOIN', 'SPECIAL', 'TOUR', 'FESTA']),
  managerId: z.string().uuid(),
  manager: z.object({
    id: z.string(),
    name: z.string(),
    rank: z.string().optional(),
    phone: z.string().optional(),
    stats: z.object({
      totalBookings: z.number()
    }).optional()
  }),
  status: z.enum(['AVAILABLE', 'DEPOSIT_PENDING', 'CONFIRMED', 'NOSHOW_CLAIMED', 'COMPLETED']),
  escrowEnabled: z.boolean().default(true),
  refundPolicy: z.string().default('3일 전 100% 환불'),
  // Optional UI fields
  holes: z.number().optional(),
  isEmergency: z.boolean().optional(),
  isTourPackage: z.boolean().optional(),
  lodgingInfo: z.string().optional(),
  joinRequirements: z.object({
    gender: z.string(),
    count: z.number()
  }).optional()
});

export type TeeTime = z.infer<typeof TeeTimeSchema>;

export function validateTeeTime(data: unknown) {
  return TeeTimeSchema.safeParse(data);
}
