# Platform Permissions Documentation

## User Roles

### 1. Owner
- **Description**: Platform owner with full administrative access
- **Permissions**:
  - All admin permissions
  - Access to financial reports
  - System configuration
  - User management
  - Content management
  - Tutor approval/rejection

### 2. Admin
- **Description**: Platform administrators
- **Permissions**:
  - User management (except other admins/owners)
  - Content management
  - Tutor approval/rejection
  - View all bookings
  - Manage resources
  - Access admin panel

### 3. Teacher
- **Description**: Platform teachers/instructors
- **Permissions**:
  - View their bookings
  - Confirm/decline bookings
  - Access teacher dashboard
  - Update their profile
  - View their earnings

### 4. Tutor
- **Description**: Independent tutors offering services
- **Account Status**:
  - `pending`: Can login but limited access (browse resources only)
  - `active`: Full tutor access
  - `suspended`: Cannot login
- **Permissions (when active)**:
  - Receive bookings
  - View their schedule
  - Update availability
  - Set rates
  - View student information for their bookings

### 5. Parent
- **Description**: Parents managing family accounts
- **Permissions**:
  - Create child accounts
  - Book tutoring sessions for themselves or children
  - View all family bookings
  - Manage child account settings
  - Reset child passwords
  - View child progress and activity
  - Make payments
  - Access "Find a Tutor" section

### 6. Personal (formerly Student)
- **Description**: Individual users
- **Two Types**:
  
  #### Independent Personal Account (no parent_id)
  - Book tutoring sessions for themselves
  - Access all learning resources
  - View their bookings
  - Access "Find a Tutor" section
  - Manage their own account
  
  #### Child Account (has parent_id)
  - **Cannot** book tutoring sessions
  - **Cannot** access "Find a Tutor" section
  - Can view sessions booked for them
  - Can join their sessions
  - Access learning resources
  - View their progress
  - Limited account management (parent controls major settings)

## Feature Access Matrix

| Feature | Owner | Admin | Teacher | Tutor (Active) | Tutor (Pending) | Parent | Personal (Independent) | Personal (Child) |
|---------|-------|-------|---------|----------------|-----------------|--------|------------------------|------------------|
| Admin Panel | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Find a Tutor | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Book Sessions | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Book for Children | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| View Resources | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage Tutors | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Approve Tutors | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create Child Accounts | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| View Financial Reports | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Receive Bookings | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

## Authentication & Account Status

### Account Status Types
- **active**: Full access to role-based features
- **pending**: Limited access (mainly for tutors awaiting approval)
- **suspended**: Cannot login

### Login Behavior
- Active accounts: Full access based on role
- Pending accounts: Can login with restricted features
  - Tutors: Can browse resources, view dashboard with pending banner
  - Other roles typically don't have pending status
- Suspended accounts: Login blocked with message to contact support

## Booking Permissions

### Who Can Book
1. **Parents**: Can book for themselves or any of their children
2. **Personal (Independent)**: Can book for themselves only
3. **Personal (Child)**: Cannot book sessions

### Who Cannot Book
1. **Tutors**: Cannot book other tutors
2. **Teachers**: Receive bookings but don't book tutors
3. **Child Accounts**: Must have parent book for them

### Booking Process for Parents
1. Parent selects tutor and time
2. System prompts: "Who is this session for?"
3. Parent selects from:
   - Self
   - List of their children
4. Booking is created with:
   - `bookedBy`: Parent's user ID
   - `studentId`: Selected child's ID (or parent's ID if for self)

## API Endpoint Permissions

### Public Endpoints (No Auth Required)
- GET `/api/health` (health check)
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/tutors` (active tutors only)
- GET `/api/tutors/:id` (active tutors only)
- GET `/api/tutors/:tutorId/availability` (check tutor availability)
- GET `/api/resources/grades`
- GET `/api/resources/subtopics/:subtopicId/resources`

### Authenticated Endpoints
- POST `/api/auth/logout`
- POST `/api/auth/refresh`
- GET `/api/bookings/my-bookings`
- POST `/api/bookings` (restricted for child accounts)

### Tutor-Only Endpoints
- GET `/api/tutors/:tutorId/schedule` (view their schedule)
- PUT `/api/tutors/:tutorId/availability` (update availability)
- POST `/api/tutors/:tutorId/availability/override` (add date-specific overrides)

### Parent-Only Endpoints
- POST `/api/users/create-child`
- GET `/api/users/children`
- GET `/api/users/child/:id`
- PUT `/api/users/child/:id`
- POST `/api/users/child/:id/reset-password`
- DELETE `/api/users/child/:id`

### Admin/Owner-Only Endpoints
- GET `/api/tutors/admin/all`
- POST `/api/tutors/admin/create`
- PUT `/api/tutors/admin/:id`
- DELETE `/api/tutors/admin/:id`
- PATCH `/api/tutors/admin/:id/approve`
- PATCH `/api/tutors/admin/:id/reject`
- PATCH `/api/tutors/admin/:id/toggle`
- GET `/api/resources/all` (view all resources)
- POST `/api/resources` (create new resource)
- PUT `/api/resources/:id` (update resource)
- DELETE `/api/resources/:id` (delete resource)

### Teacher-Only Endpoints
- GET `/api/bookings/teacher/bookings`
- POST `/api/bookings/teacher/bookings/:id/confirm`
- POST `/api/bookings/teacher/bookings/:id/decline`

## Security Notes

1. **Parent-Child Relationship**: Always verify `parent_id` ownership before allowing parent operations
2. **Booking Validation**: Check that parents can only book for their own children
3. **Account Status Checks**: Enforce status restrictions at both API and UI levels
4. **Role Verification**: Always validate user role before granting access to features
5. **Token Security**: Include role and account_status in JWT tokens for quick validation

## Recent Changes (2025-09-16)

1. **Renamed "Student" to "Personal"**: All student accounts are now "personal" accounts
2. **Added Account Status System**: Active, Pending, Suspended states
3. **Implemented Parent-Child Management**: Parents can create and manage child accounts
4. **Updated Booking Restrictions**: Child accounts cannot book sessions
5. **Pending Tutor Access**: Tutors can login while pending but with limited features
6. **Navigation Updates**: "Find a Tutor" hidden for child accounts