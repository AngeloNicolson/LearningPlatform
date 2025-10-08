# Database Schema Diagram

Industry-standard schema with 8 tables focused on active features.

```mermaid
erDiagram
    users ||--o{ user_relationships : "parent"
    users ||--o{ user_relationships : "child"
    users ||--o{ tutors : "has"
    users ||--o{ bookings : "books"
    users ||--o{ documents : "uploads"

    tutors ||--o{ bookings : "receives"

    grade_levels ||--o{ topics : "contains"

    topics ||--o{ subject_resources : "categorizes"

    documents ||--o{ subject_resources : "linked_to"

    users {
        int id PK
        string email UK
        string password_hash
        string first_name
        string last_name
        string role
        string account_status
        timestamp created_at
        timestamp updated_at
    }

    user_relationships {
        int id PK
        int parent_user_id FK
        int child_user_id FK
        string relationship_type
        timestamp created_at
    }

    tutors {
        int id PK
        int user_id FK
        string display_name
        string bio
        jsonb subjects
        string[] grades
        decimal hourly_rate
        boolean accepts_group_sessions
        int min_group_size
        int max_group_size
        jsonb group_pricing
        jsonb availability
        string approval_status
        boolean is_active
        decimal rating
        int total_sessions
        timestamp created_at
        timestamp updated_at
    }

    bookings {
        int id PK
        int tutor_id FK
        int student_id FK
        date session_date
        time start_time
        time end_time
        string status
        text notes
        timestamp created_at
        timestamp updated_at
    }

    grade_levels {
        string id PK
        string name
        string subject
        string grade_range
        text description
        int display_order
    }

    topics {
        string id PK
        string name
        string grade_level_id FK
        string icon
        text description
        int display_order
        timestamp created_at
    }

    subject_resources {
        string id PK
        string subject
        string topic_id FK
        string topic_name
        string topic_icon
        string resource_type
        string title
        text description
        text url
        text content
        string era
        string grade_level
        int document_id FK
        boolean visible
        int display_order
    }

    documents {
        int id PK
        string title
        text description
        string filename
        string original_name
        string mime_type
        int file_size
        string file_path
        int uploaded_by FK
        int download_count
        timestamp created_at
        timestamp updated_at
    }

```

## Quick Reference

### Main Tables
- **users**: All platform users (students, parents, teachers, tutors, admins, owner)
- **user_relationships**: Parent-child relationships (many-to-many junction table)
- **tutors**: Tutor-specific information linked to user accounts
- **bookings**: Tutoring session bookings

### Resource Management
- **grade_levels**: Subject-based grade level organization (Elementary, Middle, High School, College)
- **topics**: Main topics under each grade level (e.g., "Arithmetic" under Elementary Math)
- **subject_resources**: Educational resources (worksheets, videos, quizzes, lessons)

### Content Storage
- **documents**: File storage only (PDFs, worksheets) - contains file metadata, not educational metadata

### Key Design Principle
- **documents** = File storage (filename, size, path, mime type)
- **subject_resources** = Educational metadata (topic, grade level, resource type)
- They link via `document_id` to keep concerns separated

## Table Relationships

### User Hierarchy
```
users (all authentication)
  ├── user_relationships (parent ↔ child mapping)
  └── tutors (extended tutor profile)

Example:
Parent User (id=1) ←→ user_relationships ←→ Student User (id=5)
  relationship: parent_user_id=1, child_user_id=5
```

### Resource Organization
```
grade_levels (e.g., Elementary Math)
  └── topics (e.g., Arithmetic)
      └── subject_resources (worksheets, videos, quizzes, lessons)
          └── documents (PDF files)
```

### How It Works
```
Student searches "addition worksheets"
  → Query: subject_resources WHERE title LIKE '%addition%' AND resource_type = 'worksheet'
  → Returns: All addition worksheets with their linked PDF files
```
