# Data Model: Ansim Golf

## 1. Entities (Zod Schemas)

### 1.1. GolfCourse (골프장)
```typescript
const GolfCourseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  region: z.enum(['SUDOKWON_SOUTH', 'SUDOKWON_NORTH', 'CHUNGCHEONG', 'GANGWON', 'ETC']),
  image: z.string().url(),
  address: z.string(),
  holesCount: z.number().int().positive()
});
```

### 1.2. TeeTime (티타임)
```typescript
const TeeTimeSchema = z.object({
  id: z.string().uuid(),
  courseId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  price: z.number().nonnegative(),
  originalPrice: z.number().nonnegative(),
  type: z.enum(['TRANSFER', 'JOIN', 'SPECIAL', 'TOUR']),
  managerId: z.string().uuid(),
  status: z.enum(['AVAILABLE', 'PENDING', 'CONFIRMED', 'COMPLETED']),
  escrowEnabled: z.boolean().default(true)
});
```

### 1.3. Booking (예약)
```typescript
const BookingSchema = z.object({
  id: z.string().uuid(),
  teeTimeId: z.string().uuid(),
  userId: z.string().uuid(),
  amount: z.number().positive(),
  paymentKey: z.string().optional(),
  status: z.enum(['READY', 'IN_PROGRESS', 'DONE', 'CANCELED']),
  createdAt: z.date()
});
```

## 2. Database Schema (D1 SQL)
```sql
CREATE TABLE golf_courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  image TEXT,
  address TEXT,
  holes_count INTEGER
);

CREATE TABLE tee_times (
  id TEXT PRIMARY KEY,
  course_id TEXT REFERENCES golf_courses(id),
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  price INTEGER NOT NULL,
  manager_id TEXT NOT NULL,
  status TEXT DEFAULT 'AVAILABLE',
  escrow_enabled INTEGER DEFAULT 1
);
```
