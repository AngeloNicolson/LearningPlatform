# Learning Platform - Permissions & Access Control Documentation

## METADATA
- **Version**: 1.0.0
- **Last Updated**: 2025-09-15
- **Purpose**: Authoritative source for all permission and access control rules
- **Reference**: Point AI assistants to this file for permission structure: `/DOCS/Permissions.md`

---

## 🔑 QUICK REFERENCE

| Role | Priority | Can Impersonate | Full Admin | Content Management | User Management |
|------|----------|-----------------|------------|-------------------|-----------------|
| **Owner** | 1 | ✅ All roles | ✅ | ✅ | ✅ |
| **Admin** | 2 | ✅ Teacher/Student | ✅ | ✅ | ✅ Limited |
| **Teacher** | 3 | ❌ | ❌ | ✅ Own content | ❌ |
| **Parent** | 4 | ❌ | ❌ | 👁️ View only | ❌ |
| **Student** | 5 | ❌ | ❌ | 👁️ View only | ❌ |
| **Guest** | 6 | ❌ | ❌ | 👁️ Public only | ❌ |

---

## 👥 ROLE DEFINITIONS

### **OWNER** (Superadmin)
- **Purpose**: Platform owner with unrestricted access
- **Inheritance**: Has all permissions of all roles
- **Special Powers**:
  - Can impersonate any user
  - Can modify system settings
  - Can delete any data
  - Can manage billing/subscriptions
  - Can access system logs and analytics

### **ADMIN**
- **Purpose**: Platform administrator for daily operations
- **Inheritance**: Has all Teacher permissions
- **Special Powers**:
  - Can impersonate Teachers and Students
  - Can manage all users (except Owner)
  - Can manage all content
  - Can view all analytics
  - Cannot modify system settings
  - Cannot access billing information

### **TEACHER**
- **Purpose**: Content creators and tutors
- **Inheritance**: Has all Student permissions
- **Special Powers**:
  - Can create/edit/delete own content
  - Can manage own tutor profile
  - Can view student progress for their students
  - Can create and grade assignments
  - Can manage bookings

### **PARENT**
- **Purpose**: Monitor child's progress
- **Inheritance**: None
- **Special Powers**:
  - Can view linked children's progress
  - Can view children's bookings
  - Can pay for children's sessions
  - Cannot modify any content

### **STUDENT**
- **Purpose**: Primary platform users for learning
- **Inheritance**: Guest permissions
- **Special Powers**:
  - Can access all learning content
  - Can book tutoring sessions
  - Can track own progress
  - Can submit assignments

### **GUEST** (Unauthenticated)
- **Purpose**: Public visitors
- **Inheritance**: None
- **Special Powers**:
  - Can view public content only
  - Can view tutor profiles
  - Can register for an account

---

## 📊 PERMISSION MATRIX

### **Content Management**

| Action | Owner | Admin | Teacher | Parent | Student | Guest |
|--------|-------|-------|---------|--------|---------|-------|
| **RESOURCES** |
| View public resources | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View hidden resources | ✅ | ✅ | ✅ Own | ❌ | ❌ | ❌ |
| Create resources | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit any resource | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit own resources | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete any resource | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete own resources | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Toggle visibility | ✅ | ✅ | ✅ Own | ❌ | ❌ | ❌ |

### **User Management**

| Action | Owner | Admin | Teacher | Parent | Student | Guest |
|--------|-------|-------|---------|--------|---------|-------|
| View all users | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create users | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit any user | ✅ | ✅* | ❌ | ❌ | ❌ | ❌ |
| Edit own profile | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete users | ✅ | ✅* | ❌ | ❌ | ❌ | ❌ |
| Change user roles | ✅ | ✅* | ❌ | ❌ | ❌ | ❌ |
| Impersonate users | ✅ | ✅** | ❌ | ❌ | ❌ | ❌ |

*Admin cannot modify Owner accounts
**Admin can only impersonate Teacher/Student roles

### **Tutoring System**

| Action | Owner | Admin | Teacher | Parent | Student | Guest |
|--------|-------|-------|---------|--------|---------|-------|
| View tutor profiles | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Become a tutor | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit tutor profile | ✅ | ✅ | ✅ Own | ❌ | ❌ | ❌ |
| View all bookings | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View own bookings | ✅ | ✅ | ✅ | ✅ Child | ✅ | ❌ |
| Create booking | ✅ | ✅ | ✅ | ✅ For child | ✅ | ❌ |
| Cancel any booking | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Cancel own booking | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

### **Administrative Features**

| Action | Owner | Admin | Teacher | Parent | Student | Guest |
|--------|-------|-------|---------|--------|---------|-------|
| Access admin panel | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View system analytics | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View audit logs | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage grades/topics | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| System configuration | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Database management | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Billing management | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 🔌 API ENDPOINT PERMISSIONS

### **Authentication Endpoints**
| Endpoint | Method | Required Role | Notes |
|----------|--------|---------------|-------|
| `/api/auth/register` | POST | Guest | Public registration |
| `/api/auth/login` | POST | Guest | Public login |
| `/api/auth/logout` | POST | Any authenticated | |
| `/api/auth/refresh` | POST | Any authenticated | |
| `/api/auth/profile` | GET | Any authenticated | Own profile only |
| `/api/auth/profile` | PUT | Any authenticated | Own profile only |

### **Resource Endpoints**
| Endpoint | Method | Required Role | Notes |
|----------|--------|---------------|-------|
| `/api/resources/grades` | GET | Guest | Public grades list |
| `/api/resources/subtopics/:id/resources` | GET | Guest | Public resources only |
| `/api/resources/admin/*` | ALL | Admin+ | Admin-only endpoints |
| `/api/resources/admin/resources` | POST | Admin+ | Create resources |
| `/api/resources/admin/resources/:id` | PUT | Admin+ | Edit resources |
| `/api/resources/admin/resources/:id` | DELETE | Admin+ | Delete resources |
| `/api/resources/admin/resources/:id/visibility` | PATCH | Admin+ | Toggle visibility |

### **User Management Endpoints**
| Endpoint | Method | Required Role | Notes |
|----------|--------|---------------|-------|
| `/api/users` | GET | Admin+ | List all users |
| `/api/users/:id` | GET | Admin+ | View user details |
| `/api/users/:id` | PUT | Admin+ | Edit user |
| `/api/users/:id` | DELETE | Owner | Delete user |
| `/api/users/:id/role` | PATCH | Admin+ | Change role (not Owner) |
| `/api/users/:id/impersonate` | POST | Admin+ | Start impersonation |

### **Tutoring Endpoints**
| Endpoint | Method | Required Role | Notes |
|----------|--------|---------------|-------|
| `/api/tutors` | GET | Guest | Public tutor list |
| `/api/tutors/:id` | GET | Guest | Public tutor profile |
| `/api/tutors/:id/availability` | GET | Guest | Public availability |
| `/api/tutors/profile` | GET | Teacher | Own tutor profile |
| `/api/tutors/profile` | PUT | Teacher | Update own profile |
| `/api/bookings` | POST | Student+ | Create booking |
| `/api/bookings/my-bookings` | GET | Student+ | Own bookings |
| `/api/bookings/:id` | DELETE | Student+ | Cancel own booking |
| `/api/bookings/:id/confirm` | POST | Teacher | Confirm booking |

---

## 📋 BUSINESS RULES

### **Data Ownership**
1. **Resources**: Owned by creator (Teacher/Admin), editable by Admin+
2. **Bookings**: Owned by student, viewable by teacher and parent
3. **Profiles**: Owned by user, editable by self and Admin+
4. **Progress**: Owned by student, viewable by teacher and parent

### **Visibility Scopes**
1. **Public**: Visible to all users including guests
2. **Authenticated**: Visible to logged-in users only
3. **Role-based**: Visible to specific roles
4. **Owner-only**: Visible only to content owner
5. **Linked**: Visible to linked users (parent-child, teacher-student)

### **Special Conditions**
- Parents can only view/manage linked children
- Teachers can only view students enrolled in their courses
- Students under 13 require parent approval for actions
- Bookings require available balance or payment method
- Resource visibility affects all child elements

---

## 🖥️ UI COMPONENT VISIBILITY

### **Navigation Menu Items**
| Menu Item | Owner | Admin | Teacher | Parent | Student | Guest |
|-----------|-------|-------|---------|--------|---------|-------|
| Home | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Resources | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Find Tutor | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin Panel | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| My Bookings | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| My Progress | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Tutor Profile | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

### **Dashboard Widgets**
| Widget | Owner | Admin | Teacher | Parent | Student |
|--------|-------|-------|---------|--------|---------|
| System Stats | ✅ | ✅ | ❌ | ❌ | ❌ |
| User Management | ✅ | ✅ | ❌ | ❌ | ❌ |
| Resource Management | ✅ | ✅ | ✅ | ❌ | ❌ |
| Booking Calendar | ✅ | ✅ | ✅ | ✅ | ✅ |
| Progress Tracker | ✅ | ✅ | ✅ | ✅ | ✅ |
| Earnings Report | ✅ | ✅ | ✅ | ❌ | ❌ |
| Children Overview | ❌ | ❌ | ❌ | ✅ | ❌ |

---

## 💻 IMPLEMENTATION GUIDELINES

### **Permission Checking in Code**

#### **Frontend (React)**
```typescript
// Check role
if (userRole === 'admin' || userRole === 'owner') {
  // Show admin features
}

// Check specific permission
const canEditResource = (resource, userRole, userId) => {
  if (userRole === 'owner' || userRole === 'admin') return true;
  if (userRole === 'teacher' && resource.created_by === userId) return true;
  return false;
};
```

#### **Backend (Express Middleware)**
```typescript
// Role-based middleware
requireRole('admin', 'owner') // Requires admin or owner
requireRole('teacher') // Requires teacher or higher

// Resource ownership middleware
requireOwnership() // Checks if user owns the resource
```

### **Security Best Practices**
1. **Always validate on backend** - Never trust frontend validation alone
2. **Use middleware chains** - Combine authentication + role checks
3. **Audit sensitive actions** - Log all admin actions
4. **Fail secure** - Default to deny if permission unclear
5. **Validate impersonation** - Check impersonation rights before allowing
6. **Separate concerns** - Keep permission logic in dedicated middleware

### **Database Considerations**
- Store role as ENUM for consistency
- Use foreign keys for ownership tracking
- Index user_id and role for performance
- Audit table for permission changes
- Soft delete for user management

---

## 📝 NOTES FOR AI ASSISTANTS

When implementing features:
1. Always check this permission matrix first
2. Default to most restrictive permission
3. Owner role bypasses all restrictions
4. Admin cannot affect Owner accounts
5. Teachers own their created content
6. Parents only see linked children
7. Public content visible to all

For permission errors, return:
- 401: Not authenticated
- 403: Authenticated but not authorized
- 404: Resource not found (hide existence from unauthorized users)

---

**END OF PERMISSIONS DOCUMENTATION**