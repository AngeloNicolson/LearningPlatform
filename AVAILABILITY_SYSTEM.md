# 📅 Tutor Availability Management System

## Overview

A comprehensive availability system that allows tutors to:
- ✅ Set weekly recurring schedules (e.g., Mon-Fri 9am-5pm)
- ✅ Block out dates for vacations/holidays
- ✅ Set custom hours for specific dates
- ✅ Automatically calculate available booking slots
- ✅ Prevent double-booking with database-level constraints
- ✅ Real-time slot availability based on existing bookings

---

## 🗄️ Database Schema

### `tutor_availability` - Weekly Recurring Schedule

Stores tutors' regular weekly availability patterns.

```sql
CREATE TABLE tutor_availability (
  id SERIAL PRIMARY KEY,
  tutor_id INTEGER REFERENCES tutors(id),
  day_of_week INTEGER (0-6),  -- 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time TIME,
  end_time TIME,
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Examples:**
- Monday 9am-5pm
- Tuesday 10am-2pm
- Wednesday 1pm-9pm

**Features:**
- Automatic overlap detection (trigger prevents conflicts)
- Can have multiple blocks per day (e.g., 9am-12pm and 2pm-5pm)
- Can be deactivated without deletion

### `tutor_availability_exceptions` - One-Off Changes

Overrides weekly schedule for specific dates.

```sql
CREATE TABLE tutor_availability_exceptions (
  id SERIAL PRIMARY KEY,
  tutor_id INTEGER REFERENCES tutors(id),
  exception_date DATE,
  exception_type VARCHAR(20),  -- 'unavailable' or 'custom_hours'
  start_time TIME,              -- Only for custom_hours
  end_time TIME,                -- Only for custom_hours
  reason TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Exception Types:**
1. **`unavailable`** - Completely blocks the date (vacation, holiday, sick day)
2. **`custom_hours`** - Override normal schedule with specific times for one day

**Examples:**
- `unavailable`: "December 25, 2025 - Holiday"
- `custom_hours`: "December 24, 2025 - 9am-12pm only (half day)"

---

## 📡 API Endpoints

### Public Endpoints (No Auth Required)

#### Get Tutor's Weekly Schedule
```http
GET /api/availability/tutors/:tutorId/schedule
```

**Response:**
```json
{
  "tutorId": 1,
  "tutorName": "Sarah J.",
  "schedule": [
    {
      "id": 1,
      "dayOfWeek": 1,
      "dayName": "Monday",
      "startTime": "09:00:00",
      "endTime": "17:00:00",
      "isActive": true
    }
  ]
}
```

#### Get Available Booking Slots
```http
GET /api/availability/tutors/:tutorId/slots?date=2025-12-01&duration=60
```

**Query Parameters:**
- `date` (required) - ISO date format (YYYY-MM-DD)
- `duration` (optional) - Session duration in minutes (default: 60)

**Response:**
```json
{
  "tutorId": 1,
  "tutorName": "Sarah J.",
  "date": "2025-12-01",
  "duration": 60,
  "slots": [
    {
      "startTime": "09:00:00",
      "endTime": "10:00:00"
    },
    {
      "startTime": "09:30:00",
      "endTime": "10:30:00"
    },
    {
      "startTime": "10:00:00",
      "endTime": "11:00:00"
    }
  ],
  "totalSlots": 15
}
```

**How Slots are Calculated:**
1. ✅ Check day of week → Look up weekly schedule
2. ✅ Check for exceptions → Apply custom_hours or mark unavailable
3. ✅ Query existing bookings → Filter out booked times
4. ✅ Generate slots every 30 minutes (configurable)
5. ✅ Return only available (non-overlapping) slots

---

### Protected Endpoints (Auth Required)

All endpoints below require authentication and verify that the user owns the tutor profile.

#### Add Availability Block
```http
POST /api/availability/tutors/:tutorId/schedule
Authorization: Bearer <token>

{
  "dayOfWeek": 1,           // Monday
  "startTime": "09:00",
  "endTime": "17:00"
}
```

**Response:**
```json
{
  "message": "Availability added successfully",
  "availability": {
    "id": 42,
    "createdAt": "2025-11-25T10:30:00Z"
  }
}
```

**Error Cases:**
- `409 Conflict` - Overlaps with existing availability block

#### Update Availability Block
```http
PATCH /api/availability/tutors/:tutorId/schedule/:availabilityId
Authorization: Bearer <token>

{
  "startTime": "10:00",
  "endTime": "18:00",
  "isActive": true
}
```

#### Delete Availability Block
```http
DELETE /api/availability/tutors/:tutorId/schedule/:availabilityId
Authorization: Bearer <token>
```

#### Get Exceptions
```http
GET /api/availability/tutors/:tutorId/exceptions
Authorization: Bearer <token>
```

**Response:**
```json
{
  "exceptions": [
    {
      "id": 1,
      "date": "2025-12-25",
      "type": "unavailable",
      "startTime": null,
      "endTime": null,
      "reason": "Christmas Holiday"
    },
    {
      "id": 2,
      "date": "2025-12-24",
      "type": "custom_hours",
      "startTime": "09:00:00",
      "endTime": "12:00:00",
      "reason": "Half day before holiday"
    }
  ]
}
```

#### Add Exception
```http
POST /api/availability/tutors/:tutorId/exceptions
Authorization: Bearer <token>

{
  "date": "2025-12-25",
  "type": "unavailable",
  "reason": "Christmas Holiday"
}
```

**For custom hours:**
```json
{
  "date": "2025-12-24",
  "type": "custom_hours",
  "startTime": "09:00",
  "endTime": "12:00",
  "reason": "Half day"
}
```

#### Delete Exception
```http
DELETE /api/availability/tutors/:tutorId/exceptions/:exceptionId
Authorization: Bearer <token>
```

---

## 🔄 How Booking Integration Works

### When a Booking is Created:

1. **User selects a time slot** from available slots API
2. **Payment is processed** via Stripe
3. **Booking is saved** to database with `status = 'confirmed'`
4. **Slot becomes unavailable** - The `get_available_slots()` function automatically excludes it

### Database Function: `get_available_slots()`

This PostgreSQL function handles all the logic:

```sql
SELECT * FROM get_available_slots(
  p_tutor_id := 1,
  p_date := '2025-12-01',
  p_duration_minutes := 60,
  p_slot_interval_minutes := 30
);
```

**Logic Flow:**
1. Get day of week from date
2. Check for exceptions:
   - If `unavailable` → Return empty (no slots)
   - If `custom_hours` → Use exception times
   - Otherwise → Use weekly schedule
3. Generate time slots at 30-minute intervals
4. For each slot, check if it overlaps with any `confirmed` or `pending` booking
5. Return only non-overlapping slots

**Performance:**
- Uses indexes on `tutor_id`, `day_of_week`, `session_date`
- Single query execution
- Scales well with thousands of bookings

---

## 🎯 Use Cases

### Use Case 1: Regular 9-5 Tutor
```
Weekly Schedule:
- Monday-Friday: 9am-5pm

No exceptions

Result: 15 slots per weekday (30-min intervals, 60-min sessions)
```

### Use Case 2: Part-Time Evening Tutor
```
Weekly Schedule:
- Monday: 6pm-9pm
- Wednesday: 6pm-9pm
- Friday: 6pm-9pm

Result: 5 slots per session day
```

### Use Case 3: Tutor with Vacation
```
Weekly Schedule:
- Monday-Friday: 9am-5pm

Exceptions:
- Dec 20-31: Unavailable (Winter break)

Result: Normal slots except Dec 20-31 (0 slots those days)
```

### Use Case 4: Tutor with Custom Hours
```
Weekly Schedule:
- Monday-Friday: 9am-5pm

Exceptions:
- Dec 24: Custom hours 9am-12pm (half day)

Result: Dec 24 has only 7 slots instead of usual 15
```

---

## 🧪 Testing

### Test 1: View Schedule
```bash
curl -k https://localhost:3777/api/availability/tutors/1/schedule
```

### Test 2: Get Available Slots
```bash
curl -k "https://localhost:3777/api/availability/tutors/1/slots?date=2025-12-02&duration=60"
```

### Test 3: Add Availability (requires auth token)
```bash
curl -k -X POST https://localhost:3777/api/availability/tutors/1/schedule \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dayOfWeek": 6,
    "startTime": "10:00",
    "endTime": "14:00"
  }'
```

### Test 4: Block a Vacation Day
```bash
curl -k -X POST https://localhost:3777/api/availability/tutors/1/exceptions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-12-25",
    "type": "unavailable",
    "reason": "Christmas Holiday"
  }'
```

---

## 📊 Default Setup

When a tutor is created or the migration runs, **default availability is automatically added**:

- **Monday-Friday**: 9am-5pm
- **Saturday-Sunday**: No availability
- **No exceptions**

This gives tutors a standard schedule to start with, which they can customize.

---

## 🚀 Frontend Integration

### Booking Calendar Component

```typescript
// 1. Fetch available slots for selected date
const response = await fetch(
  `/api/availability/tutors/${tutorId}/slots?date=${selectedDate}&duration=${sessionDuration}`
);
const { slots } = await response.json();

// 2. Display slots in calendar UI
slots.forEach(slot => {
  renderTimeSlot(slot.startTime, slot.endTime);
});

// 3. When user selects a slot, proceed to payment
const booking = {
  tutorId,
  sessionType,
  date: selectedDate,
  startTime: selectedSlot.startTime,
  endTime: selectedSlot.endTime
};
```

### Tutor Dashboard - Manage Availability

```typescript
// Get current schedule
const schedule = await fetch(`/api/availability/tutors/${tutorId}/schedule`);

// Add new availability
await fetch(`/api/availability/tutors/${tutorId}/schedule`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    dayOfWeek: 1, // Monday
    startTime: '09:00',
    endTime: '17:00'
  })
});

// Block vacation dates
await fetch(`/api/availability/tutors/${tutorId}/exceptions`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    date: '2025-12-25',
    type: 'unavailable',
    reason: 'Holiday'
  })
});
```

---

## 🔐 Security Features

1. **Authorization checks** - Only tutor owner or admin can modify
2. **Input validation** - All inputs validated with express-validator
3. **SQL injection protection** - Parameterized queries
4. **Overlap prevention** - Database trigger prevents scheduling conflicts
5. **Data sanitization** - XSS protection on all text inputs

---

## ⚡ Performance Optimizations

1. **Database indexes** on commonly queried fields
2. **Single function call** for slot calculation (no N+1 queries)
3. **Caching opportunities** - Schedules rarely change (can cache weekly patterns)
4. **Efficient OVERLAPS operator** - PostgreSQL native time range checking

---

## 🎉 Summary

You now have a complete, production-ready availability management system:

✅ **Tutors can manage their schedules** - Add/edit weekly availability
✅ **Flexible exception handling** - Vacations, custom hours, holidays
✅ **Real-time slot calculation** - Accounts for bookings automatically
✅ **Double-booking prevention** - Database-level constraints
✅ **Scalable architecture** - Efficient queries with proper indexing
✅ **Secure endpoints** - Authentication and authorization built-in

The system automatically creates default schedules for all tutors and handles slot availability dynamically as bookings are made!
