# API Routes Documentation

## Overview

**Base URL**: `https://localhost:3001/api`  
**Authentication**: JWT tokens stored in HTTP-only cookies  
**Content-Type**: `application/json`

### Authentication
Most endpoints require authentication via JWT token in the `access-token` cookie. Tokens expire after 15 minutes and can be refreshed using the refresh endpoint.

### Response Format
```json
{
  "data": {},     // Successful response data
  "error": "",    // Error message if request failed
  "message": ""   // Optional status message
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication Routes (`/api/auth`)

### POST `/api/auth/register`
Register a new user account.

**Auth Required**: No

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "personal" | "parent" | "tutor"
}
```

**Response**: `201 Created`
```json
{
  "message": "Account created successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "personal"
  }
}
```

### POST `/api/auth/login`
Login to an existing account.

**Auth Required**: No  
**Rate Limited**: 5 attempts per 15 minutes

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**: `200 OK`
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "personal",
    "accountStatus": "active",
    "parentId": null
  }
}
```

### POST `/api/auth/logout`
Logout the current user.

**Auth Required**: Yes

**Response**: `200 OK`
```json
{
  "message": "Logout successful"
}
```

### POST `/api/auth/refresh`
Refresh the access token using refresh token.

**Auth Required**: No (requires valid refresh token)

**Response**: `200 OK`
```json
{
  "message": "Token refreshed"
}
```

---

## User Routes (`/api/users`)

### GET `/api/users/profile`
Get current user's profile.

**Auth Required**: Yes

**Response**: `200 OK`
```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "personal",
  "accountStatus": "active",
  "createdAt": "2025-01-15T10:00:00Z"
}
```

### POST `/api/users/create-child`
Create a child account (parent only).

**Auth Required**: Yes  
**Role Required**: parent

**Request Body**:
```json
{
  "firstName": "Emma",
  "lastName": "Doe",
  "email": "emma.doe@student.com",
  "password": "childpass123"
}
```

**Response**: `201 Created`
```json
{
  "message": "Child account created successfully",
  "child": {
    "id": 5,
    "email": "emma.doe@student.com",
    "firstName": "Emma",
    "lastName": "Doe"
  }
}
```

### GET `/api/users/children`
Get all children for current parent.

**Auth Required**: Yes
**Role Required**: parent

**Response**: `200 OK`
```json
[
  {
    "id": 5,
    "firstName": "Emma",
    "lastName": "Doe",
    "email": "emma.doe@student.com",
    "createdAt": "2025-01-15T10:00:00Z",
    "lastLoginAt": "2025-01-20T14:30:00Z"
  }
]
```

### POST `/api/users/children/:childId/reset-password`
Reset a child account's password (parent only).

**Auth Required**: Yes
**Role Required**: parent

**Request Body**:
```json
{
  "password": "newpassword123"
}
```

**Response**: `200 OK`
```json
{
  "message": "Password reset successfully"
}
```

### DELETE `/api/users/children/:childId`
Delete a child account (parent only).

**Auth Required**: Yes
**Role Required**: parent

**Response**: `200 OK`
```json
{
  "message": "Child account deleted successfully"
}
```

### GET `/api/users/parent`
Get parent information (child accounts only).

**Auth Required**: Yes
**Role Required**: personal (with parent_id)

**Response**: `200 OK`
```json
{
  "id": 2,
  "email": "parent@example.com",
  "firstName": "Jane",
  "lastName": "Doe"
}
```

---

## Tutor Routes (`/api/tutors`)

### GET `/api/tutors`
Get all approved active tutors.

**Auth Required**: No

**Query Parameters**:
- `grade` - Filter by grade level (elementary, middle, high, college)
- `subject` - Filter by subject

**Response**: `200 OK`
```json
[
  {
    "id": 3,
    "display_name": "Emily Watson",
    "bio": "Elementary math specialist...",
    "subjects": ["Basic Math", "Arithmetic"],
    "grades": ["elementary"],
    "hourly_rate": "45.00",
    "rating": "4.95",
    "total_sessions": 312,
    "accepts_group_sessions": true,
    "min_group_size": 2,
    "max_group_size": 6
  }
]
```

### GET `/api/tutors/:id`
Get specific tutor profile.

**Auth Required**: No

**Response**: `200 OK`
```json
{
  "id": 3,
  "display_name": "Emily Watson",
  "bio": "Elementary math specialist...",
  "subjects": ["Basic Math", "Arithmetic"],
  "grades": ["elementary"],
  "hourly_rate": "45.00",
  "rating": "4.95",
  "total_sessions": 312,
  "experience_years": 5,
  "languages": ["English"],
  "certifications": [],
  "avatar": "EW"
}
```

### GET `/api/tutors/:tutorId/availability`
Get tutor's availability for a specific date.

**Auth Required**: No

**Query Parameters**:
- `date` (required) - Date in YYYY-MM-DD format

**Response**: `200 OK`
```json
{
  "date": "2025-01-20",
  "slots": [
    {
      "time": "09:00",
      "available": true
    },
    {
      "time": "10:00",
      "available": false,
      "reason": "booked"
    }
  ]
}
```

### GET `/api/tutors/:tutorId/schedule`
Get tutor's full schedule with bookings.

**Auth Required**: Yes  
**Role Required**: tutor (own schedule) or admin

**Query Parameters**:
- `startDate` - Start date (YYYY-MM-DD)
- `endDate` - End date (YYYY-MM-DD)

**Response**: `200 OK`
```json
[
  {
    "id": 10,
    "session_date": "2025-01-20",
    "start_time": "14:00",
    "end_time": "15:00",
    "is_group_session": false,
    "status": "confirmed",
    "subject": "Algebra",
    "booked_by_first": "John",
    "booked_by_last": "Smith",
    "participants": []
  }
]
```

### PUT `/api/tutors/:tutorId/availability`
Update tutor's weekly availability.

**Auth Required**: Yes  
**Role Required**: tutor (own) or admin

**Request Body**:
```json
{
  "availability": [
    {
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "17:00",
      "isAvailable": true
    }
  ]
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Availability updated successfully"
}
```

---

## Booking Routes (`/api/bookings`)

### POST `/api/bookings`
Create a new booking.

**Auth Required**: Yes  
**Restricted**: Child accounts cannot book

**Request Body**:
```json
{
  "tutorId": 3,
  "sessionDate": "2025-01-20",
  "startTime": "14:00",
  "duration": 60,
  "subject": "Algebra",
  "isGroupSession": false,
  "studentId": 5,
  "notes": "Focus on quadratic equations"
}
```

**Response**: `201 Created`
```json
{
  "id": 15,
  "message": "Booking created successfully",
  "booking": {
    "id": 15,
    "tutor_id": 3,
    "session_date": "2025-01-20",
    "start_time": "14:00",
    "end_time": "15:00",
    "status": "pending",
    "total_amount": "45.00"
  }
}
```

### GET `/api/bookings/my-bookings`
Get current user's bookings.

**Auth Required**: Yes

**Query Parameters**:
- `status` - Filter by status (pending, confirmed, cancelled)
- `upcoming` - Show only future bookings (true/false)

**Response**: `200 OK`
```json
[
  {
    "id": 15,
    "session_date": "2025-01-20",
    "start_time": "14:00",
    "end_time": "15:00",
    "tutor_name": "Emily Watson",
    "subject": "Algebra",
    "status": "confirmed",
    "is_group_session": false,
    "total_amount": "45.00"
  }
]
```

### PUT `/api/bookings/:id/cancel`
Cancel a booking.

**Auth Required**: Yes  
**Restriction**: Only booking creator or admin

**Response**: `200 OK`
```json
{
  "message": "Booking cancelled successfully"
}
```

---

## Resources Routes (`/api/resources`)

### GET `/api/resources/grades`
Get all grade levels with topics and subtopics.

**Auth Required**: No

**Response**: `200 OK`
```json
[
  {
    "id": "elementary",
    "name": "Elementary",
    "grade_range": "Grades K-5",
    "topics": [
      {
        "id": "elem-arithmetic",
        "name": "Basic Arithmetic",
        "subtopics": [
          {
            "id": "elem-addition",
            "name": "Addition"
          }
        ]
      }
    ]
  }
]
```

### GET `/api/resources/subtopics/:subtopicId/resources`
Get resources for a specific subtopic.

**Auth Required**: No

**Response**: `200 OK`
```json
{
  "resources": {
    "worksheets": [
      {
        "id": "ws-add-1",
        "title": "Basic Addition Worksheet",
        "description": "Single-digit addition problems",
        "url": "/worksheets/basic-addition.pdf"
      }
    ],
    "videos": [],
    "practice": [],
    "quizzes": []
  },
  "history": {
    "id": "hist-addition",
    "title": "The History of Addition",
    "content": "# The Story of Addition..."
  }
}
```

### GET `/api/resources/all`
Get all resources (admin only).

**Auth Required**: Yes  
**Role Required**: admin, owner

**Response**: `200 OK`
```json
[
  {
    "id": "ws-add-1",
    "subtopic_name": "Addition",
    "topic_name": "Basic Arithmetic",
    "grade_name": "Elementary",
    "resource_type": "worksheet",
    "title": "Basic Addition Worksheet",
    "visible": true
  }
]
```

### POST `/api/resources`
Create a new resource.

**Auth Required**: Yes  
**Role Required**: admin, owner

**Request Body**:
```json
{
  "subtopic_id": "elem-addition",
  "resource_type": "worksheet",
  "title": "Advanced Addition",
  "description": "Two-digit addition problems",
  "pdf_url": "/worksheets/advanced-addition.pdf",
  "visible": true,
  "display_order": 3
}
```

**Response**: `201 Created`

### PUT `/api/resources/:id`
Update a resource.

**Auth Required**: Yes  
**Role Required**: admin, owner

**Request Body**:
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "visible": false
}
```

**Response**: `200 OK`

### DELETE `/api/resources/:id`
Delete a resource.

**Auth Required**: Yes  
**Role Required**: admin, owner

**Response**: `200 OK`
```json
{
  "message": "Resource deleted successfully"
}
```

---

## Teacher Routes (`/api/teachers`)

### GET `/api/teachers/dashboard`
Get teacher dashboard data.

**Auth Required**: Yes  
**Role Required**: teacher

**Response**: `200 OK`
```json
{
  "upcomingClasses": [],
  "students": [],
  "earnings": {
    "thisMonth": "0.00",
    "total": "0.00"
  }
}
```

---

## Admin Routes

### GET `/api/tutors/admin/all`
Get all tutors including inactive.

**Auth Required**: Yes  
**Role Required**: admin, owner

**Response**: `200 OK`

### PATCH `/api/tutors/admin/:id/approve`
Approve a pending tutor.

**Auth Required**: Yes  
**Role Required**: admin, owner

**Response**: `200 OK`
```json
{
  "message": "Tutor approved successfully"
}
```

### PATCH `/api/tutors/admin/:id/reject`
Reject a tutor application.

**Auth Required**: Yes  
**Role Required**: admin, owner

**Request Body**:
```json
{
  "reason": "Insufficient qualifications"
}
```

**Response**: `200 OK`

### PATCH `/api/tutors/admin/:id/toggle`
Toggle tutor active status.

**Auth Required**: Yes  
**Role Required**: admin, owner

**Response**: `200 OK`

---

## Error Responses

All endpoints may return error responses in this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common error scenarios:
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource doesn't exist
- `400 Bad Request`: Invalid request parameters
- `500 Internal Server Error`: Server-side error

---

## Rate Limiting

Global rate limit: 100 requests per 15 minutes per IP  
Auth endpoints: 5 requests per 15 minutes per IP

Exceeded rate limit response:
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```