# 👨‍🏫 Tutor Dashboard - Calendly-Style Availability Manager

## Overview

A complete Calendly-style availability management system for tutors! Tutors can now easily set their working hours, block vacation dates, and manage custom schedules - just like using Calendly.

---

## 🎯 Features

✅ **Weekly Recurring Schedule** - Set your regular weekly availability (e.g., Mon-Fri 9am-5pm)
✅ **Multiple Time Blocks Per Day** - Add multiple availability windows (e.g., morning and evening slots)
✅ **Vacation Management** - Block out dates for holidays, vacations, sick days
✅ **Custom Hours** - Override your normal schedule for specific dates (e.g., half-day on Friday)
✅ **Real-Time Availability** - Students only see slots that are actually available
✅ **Visual Interface** - Clean, intuitive UI similar to Calendly
✅ **Auto-Sync with Bookings** - Booked slots automatically disappear from availability

---

## 🚀 How to Access

### For Tutors:

1. **Log in** with a teacher account
2. **Look for "MY TUTOR HUB"** button in the sidebar (👨‍🏫 icon)
3. **Click it** to access your tutor dashboard
4. **Select "Availability" tab** to manage your schedule

---

## 📅 Weekly Schedule Management

### View Your Schedule

The dashboard shows your weekly availability in a calendar grid format:

```
Monday    Tuesday   Wednesday  Thursday   Friday    Saturday  Sunday
9-5pm     9-5pm     9-5pm      9-5pm      9-5pm    Unavail.  Unavail.
```

### Add Availability Block

1. Select **day of week** from dropdown
2. Set **start time** (e.g., 09:00)
3. Set **end time** (e.g., 17:00)
4. Click **"+ Add"**

**Example:** Add Monday 9am-5pm availability
```
Day: Monday
Start: 09:00
End: 17:00
→ Click "Add"
```

### Multiple Blocks Per Day

You can add multiple time blocks for the same day:

**Example: Morning and Evening Only**
```
Block 1: Monday 09:00 - 12:00  (Morning)
Block 2: Monday 18:00 - 21:00  (Evening)
```

Students will only see slots during these times.

### Enable/Disable Blocks

- Click the **👁️ icon** to temporarily disable a block without deleting it
- Disabled blocks show as grayed out
- Click again to re-enable

### Delete Blocks

- Click the **🗑️ icon** to permanently remove an availability block

---

## 🚫 Exceptions & Vacations

### Types of Exceptions

**1. Unavailable (Vacation/Holiday)**
- Completely blocks the date
- No bookings allowed
- Use for: Vacations, holidays, sick days, conferences

**2. Custom Hours**
- Overrides your normal schedule for one specific date
- Set different hours just for that day
- Use for: Half days, special hours, flexible scheduling

### Add an Exception

#### Option 1: Mark as Unavailable
```
Date: December 25, 2025
Type: Unavailable
Reason: Christmas Holiday
→ Click "Add Exception"
```

**Result:** December 25 will show 0 available slots to students

#### Option 2: Set Custom Hours
```
Date: December 24, 2025
Type: Custom Hours
Start: 09:00
End: 12:00
Reason: Half day before holiday
→ Click "Add Exception"
```

**Result:** December 24 will only show slots from 9am-12pm (instead of your normal schedule)

### Remove Exceptions

- View your upcoming exceptions in the list
- Click **"Remove"** to delete an exception
- Your normal schedule will apply again

---

## 💡 How It Works

### For Tutors:

1. **Set weekly schedule** → Define your regular availability
2. **Add exceptions** → Block dates or set custom hours
3. **Forget about it** → System handles everything automatically

### For Students:

1. **Browse tutors** → Find a tutor they like
2. **Select date** → Pick a date for their session
3. **See available slots** → System shows only truly available times
4. **Book instantly** → No back-and-forth needed!

### Behind the Scenes:

```
Student clicks December 5th:
├─ System checks day of week (Tuesday)
├─ Looks up tutor's Tuesday schedule (9am-5pm)
├─ Checks for exceptions (none)
├─ Queries existing bookings (2pm-3pm booked)
├─ Generates slots every 30 minutes
├─ Filters out 2pm-3pm slot
└─ Shows available slots to student
```

---

## 📊 Example Scenarios

### Scenario 1: Simple Weekly Schedule

**Setup:**
```
Monday-Friday: 9am-5pm
Saturday-Sunday: Unavailable
```

**Result:**
- Students see slots Mon-Fri only
- Weekends completely blocked

### Scenario 2: Part-Time Evening Tutor

**Setup:**
```
Monday:    6pm-9pm
Wednesday: 6pm-9pm
Friday:    6pm-9pm
```

**Result:**
- Only 3 evenings per week available
- 5 slots per evening (30-min intervals, 60-min sessions)

### Scenario 3: Vacation Block

**Setup:**
```
Weekly: Monday-Friday 9am-5pm
Exception: Dec 20-31 marked as "Unavailable"
```

**Result:**
- Normal availability Nov 1 - Dec 19
- Dec 20-31: Zero slots available
- Back to normal Jan 1+

### Scenario 4: Custom Hours for One Day

**Setup:**
```
Weekly: Monday-Friday 9am-5pm
Exception: Dec 24 Custom Hours 9am-12pm
```

**Result:**
- Dec 23: Normal (9am-5pm = 15 slots)
- Dec 24: Half day (9am-12pm = 7 slots)
- Dec 25: Normal again (9am-5pm = 15 slots)

---

## 🔄 Booking Integration

### When a Student Books:

1. **Student selects slot** → e.g., Monday 2pm-3pm
2. **Payment processed** → via Stripe
3. **Booking confirmed** → saved to database
4. **Slot becomes unavailable** → immediately hidden from other students
5. **Tutor sees booking** → in "My Bookings" tab

### Automatic Updates:

- ✅ Booked slots **automatically disappear** from availability
- ✅ Cancelled bookings **automatically reappear** as available
- ✅ No manual updates needed
- ✅ Real-time synchronization

---

## 🎨 Default Schedule

When you first access the tutor dashboard, a default schedule is automatically created:

```
Monday:    9am-5pm ✓
Tuesday:   9am-5pm ✓
Wednesday: 9am-5pm ✓
Thursday:  9am-5pm ✓
Friday:    9am-5pm ✓
Saturday:  Unavailable ✗
Sunday:    Unavailable ✗
```

You can customize this however you want!

---

## 📱 User Interface

### Main Dashboard Tabs

1. **📅 Availability** - Manage your schedule (covered in this guide)
2. **📚 My Bookings** - View upcoming sessions (coming soon)
3. **👤 Profile Settings** - Edit your tutor profile (coming soon)

### Weekly Schedule View

- **7 columns** (one per day)
- **Day name** at top
- **Block count** indicator
- **Time blocks** listed vertically
- **Action buttons** (enable/disable, delete)

### Exceptions View

- **Add exception form** at top
- **List of upcoming exceptions** below
- **Sorted by date** (closest first)
- **Color coded** (🚫 unavailable, ⏰ custom hours)

---

## 🔐 Security & Authorization

- ✅ **Authentication required** - Must be logged in
- ✅ **Role check** - Only teachers can access tutor dashboard
- ✅ **Authorization** - Can only edit your own schedule
- ✅ **Input validation** - All times and dates validated
- ✅ **Overlap prevention** - Can't create conflicting time blocks

---

## ⚡ Performance

- **Fast queries** - Indexed database lookups
- **Efficient calculations** - Single function call for slot generation
- **No N+1 queries** - Optimized database access
- **Real-time updates** - Changes reflect immediately

---

## 🧪 Testing Your Setup

### Test 1: Add Weekly Availability

```bash
1. Go to Tutor Dashboard
2. Click "Availability" tab
3. Add: Monday 9am-5pm
4. Verify it appears in the Monday column
```

### Test 2: Block a Vacation

```bash
1. Click "Exceptions & Vacations" tab
2. Select future date
3. Type: Unavailable
4. Reason: "Test vacation"
5. Add exception
6. Verify it appears in exceptions list
```

### Test 3: Check Student View

```bash
1. Open incognito/private browser
2. Browse tutors (without logging in)
3. Select your tutor profile
4. Pick a date you set as available
5. Verify slots appear correctly
6. Pick your blocked vacation date
7. Verify no slots show up
```

---

## 🐛 Troubleshooting

### Issue: "No tutor profile found"

**Solution:**
- You need to complete tutor onboarding first
- Contact admin to approve your tutor application

### Issue: Availability not saving

**Solution:**
- Check browser console for errors
- Verify you're logged in as a teacher
- Try refreshing the page

### Issue: Students not seeing my availability

**Solution:**
- Make sure blocks are **enabled** (👁️ icon should not show 🚫)
- Check that date is **not blocked** in exceptions
- Verify your tutor profile is **approved** and **active**

---

## 📚 Additional Resources

- **API Documentation**: See `AVAILABILITY_SYSTEM.md`
- **Booking System**: See `SECURE_BOOKING_SETUP.md`
- **Backend Code**: `api/src/routes/availability.ts`
- **Frontend Code**: `client/src/components/tutor/AvailabilityManager/`

---

## 🎉 Summary

You now have a **complete Calendly-style availability system**!

**Tutors can:**
- ✅ Set weekly schedules
- ✅ Block vacation dates
- ✅ Set custom hours for specific dates
- ✅ Enable/disable time blocks
- ✅ Manage everything from one dashboard

**Students see:**
- ✅ Only truly available slots
- ✅ Real-time availability
- ✅ No double-booking possible
- ✅ Instant booking confirmation

**System handles:**
- ✅ Automatic slot calculation
- ✅ Booking conflicts prevented
- ✅ Database-level integrity
- ✅ Real-time synchronization

No more manual calendar management - just set it and forget it! 🚀
