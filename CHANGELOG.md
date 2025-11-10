# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - Learning Pathways (Courses) Infrastructure (2025-11-10)

**Feature Overview:**
- Added subject hub pages for all 6 subjects (Math, Science, History, Biblical Studies, Biblical History, Science & the Bible)
- Each subject now has a hub with two main options:
  - "Browse Resources" - Access to existing worksheets, videos, and materials
  - "Learning Pathways (Coming Soon)" - Placeholder for future structured courses feature

**New Components:**
- `SubjectHub` - Generic reusable hub component with two-card layout (fully theme-aware)
- `CoursesComingSoon` - Placeholder page explaining the upcoming Learning Pathways feature (fully theme-aware)
- Subject-specific hub pages: `MathHubPage`, `ScienceHubPage`, `HistoryHubPage`, `BibleHubPage`, `BiblicalHistoryHubPage`, `ScienceBibleHubPage`

**Styling:**
- All new components use CSS variables from the theme system
- Responsive design with mobile-first approach
- Tofu Famicom retro aesthetic with Orbitron font
- Smooth hover effects and transitions
- Gradient overlays and shadow effects using theme colors

**Navigation Updates:**
- Core Subjects and Electives pages now navigate to subject hubs instead of directly to resources
- Added navigation state properties: `courseSubject`, `biblicalHistoryTab`, `scienceBibleTab`
- New views: `*-hub`, `*-resources`, `courses-coming-soon` for all subjects

**Coming Soon Feature:**
- Structured learning pathways with sequential lessons (like Khan Academy grade pathways)
- Progress tracking through courses
- Certificates upon completion
- Practice problems and assessments
- Personalized learning adapted to grade level

### Added - Tutor Content Marketplace System (2025-11-08)

#### Phase 0: Security & Compliance Foundation

**Database Migrations:**
- `018_audit_logs.sql` - Comprehensive audit logging for GDPR/COPPA compliance
  - Tracks all significant user actions (login, content access, purchases, admin actions)
  - Stores hashed IP addresses and user agents for security analysis
  - Indexed for efficient querying by user, action type, and resource

- `019_parental_consents.sql` - COPPA compliance for child accounts
  - Manages parental consent for users under 13
  - Tracks consent method (online form, signed document, verified email)
  - Stores IP hash verification and document references

- `020_user_consents.sql` - Cookie and marketing consent management
  - Granular consent tracking (cookies, analytics, marketing, third-party)
  - Supports consent withdrawal and audit trail

- `021_data_retention_log.sql` - Right to erasure compliance
  - Tracks data deletion requests and completion
  - Records what data was deleted and when
  - Supports GDPR Article 17 compliance

- `022_users_encryption_and_child_fields.sql` - Enhanced user security
  - Added encrypted email storage (AES-256-GCM)
  - Added email hash for lookups without decryption
  - Added child account support with parent relationships
  - Added date of birth tracking for age verification

- `023_tutors_stripe_and_earnings.sql` - Payment infrastructure
  - Stripe Connect integration for tutor payouts
  - Earnings tracking (total, pending, lifetime payouts)
  - Onboarding status and payout enablement flags

**Security Modules:**
- `api/src/modules/security/encryption.ts` - Encryption utilities
  - AES-256-GCM encryption for PII protection
  - SHA-256 hashing for IP addresses and lookups
  - Secure key management with environment variables
  - Functions: `encryptPII()`, `decryptPII()`, `hashForLookup()`, `hashIP()`

- `api/src/modules/security/audit.ts` - Audit logging system
  - 25+ predefined audit action types
  - Automatic IP hashing and metadata capture
  - Integration with database audit_logs table
  - Type-safe enum for all audit actions

**Environment Configuration:**
- Added encryption keys (ENCRYPTION_KEY, ENCRYPTION_SALT)
- Added payment provider configuration (PAYMENT_PROVIDER, PLATFORM_FEE_PERCENT)
- Added storage provider configuration (STORAGE_PROVIDER, MALWARE_SCAN_ENABLED)

#### Phase 1: Content Marketplace Database Schema

**Database Migrations:**
- `024_tutor_content.sql` - Core content catalog
  - Content types: course, lesson, article, resource, bundle
  - Status workflow: draft → published → archived
  - JSONB metadata for flexible content-specific data
  - View count and purchase count tracking

- `025_content_files.sql` - File attachment system
  - Supports multiple files per content item
  - File metadata (size, MIME type, hash)
  - Malware scan status tracking
  - Storage location abstraction (filesystem/S3)

- `026_content_pricing.sql` - Flexible pricing models
  - Pricing models: one_time, subscription, free, bundle, session_package
  - Support for multiple pricing options per content
  - Billing intervals for subscriptions (monthly, yearly, quarterly)
  - JSONB config for model-specific settings
  - Constraints ensure data integrity (free=$0, subscriptions have intervals)

- `027_payment_transactions.sql` - Payment processing
  - Full transaction history with Stripe integration
  - Automatic revenue splitting (platform fee + tutor earnings)
  - Status tracking: pending → succeeded/failed/refunded
  - Constraint ensures fee + earnings = total amount

- `028_content_purchases.sql` - Purchase history
  - Links users to purchased content
  - Access expiration for subscriptions/time-limited content
  - Purchase metadata (price paid, transaction reference)

- `029_content_assignments.sql` - Parent-to-child access control
  - Parents can assign purchased content to children
  - Tracks who granted access and when
  - Support for time-limited access

- `030_purchase_requests.sql` - Child purchase requests
  - Children can request content from parents
  - Parents approve/deny with optional messages
  - Status workflow: pending → approved/denied/cancelled
  - Prevents duplicate pending requests

**Seed Data:**
- `031_seed_tutor_marketplace_data.sql` - Sample marketplace data
  - 8 tutors with varying Stripe Connect status
  - Realistic earnings, payouts, and content counts
  - Test scenarios: active sellers, onboarded but no sales, not onboarded

- `032_seed_tutor_content.sql` - Initial content catalog
  - Sarah (Math): 5 items - course ($49.99), lesson ($9.99), article (FREE), resource ($14.99), subscription ($24.99/mo)
  - James (Calculus): 3 items - course ($89.99), lesson ($19.99), resource (FREE)
  - Mike (Science): 2 items - course ($59.99), article (FREE)

- `033_seed_remaining_tutor_content.sql` - Complete content library
  - Emma (Algebra): 3 items - course ($64.99), lesson ($12.99), resource (FREE)
  - Kevin (Statistics): 2 items - course ($74.99), article (FREE)
  - David (Physics): 4 items - course ($99.99), lesson ($16.99), resource (FREE), subscription ($29.99/mo)
  - Lisa (Biology): 2 items - course ($54.99), article (FREE)
  - Rachel (Chemistry): 5 items - 2 courses ($84.99, $44.99), lesson ($11.99), resource (FREE), subscription ($27.99/mo)
  - **Total: 26 content items across 8 tutors**

#### Phase 2: API & Frontend Integration

**API Endpoints:**
- `GET /api/tutors/:id/content` - Fetch tutor's published content catalog
  - Public endpoint (no authentication required)
  - Returns content with pricing, view counts, purchase counts
  - Joins tutor_content and content_pricing tables
  - Only shows published content from approved tutors

**Frontend Components:**
- `client/src/components/tutoring/TutorProfile/TutorProfile.tsx` - Updated tutor profile
  - Added `TutorContent` interface for type safety
  - Added `fetchTutorContent()` to retrieve content from API
  - Added "Content Library" section after specialties
  - Responsive grid layout for content cards
  - Content type badges (course, lesson, article, resource, bundle)
  - Pricing display with support for free, one-time, and subscription models
  - View count and purchase count stats
  - Purchase/View buttons based on pricing model

- `client/src/components/tutoring/TutorProfile/TutorProfile.css` - Content library styling
  - Responsive content grid (auto-fill, minmax 280px)
  - Hover effects and card transitions
  - Badge system for content types and free items
  - Clean, modern design matching existing app style

**Bug Fixes:**
- Fixed missing `total_hours` column error in tutors API
  - Changed to calculate from `total_sessions` field
  - Updated `api/src/routes/tutors.ts:211, 245-246`

- Fixed `tutor.specialties.map is not a function` error
  - Backend now extracts specialties array from subjects object
  - Frontend updated to use specialties array from API
  - Updated `api/src/routes/tutors.ts:226-235` and `client/src/components/tutoring/TutorProfile/TutorProfile.tsx:190`

- Fixed authentication blocking content endpoint
  - Moved content endpoint before `router.use(requireAuth)` middleware
  - Content catalog now publicly accessible for discovery

### Technical Architecture

**Modular Monolith Design:**
- Clean service boundaries for future microservices extraction
- Service abstractions for payment (Stripe) and storage (filesystem/S3)
- Event-driven architecture preparation for loose coupling
- JSONB metadata for schema flexibility without migrations

**Security & Compliance:**
- AES-256-GCM encryption for PII
- SHA-256 hashing for IP addresses and email lookups
- COPPA compliance (parental consent, child accounts)
- GDPR compliance (audit logs, right to erasure, data export ready)
- Privacy Act compliance (NZ/AUS regulations)

**Scalability Features:**
- JSONB for flexible content metadata
- Indexed queries for performance
- Stripe Connect for distributed payments
- Revenue splitting with platform fees (configurable, default 20%)
- Content discovery on tutor profiles (no separate marketplace overhead)

### Database Schema Summary

**New Tables (13):**
1. `audit_logs` - GDPR/COPPA audit trail
2. `parental_consents` - Child account consent tracking
3. `user_consents` - Cookie/marketing consent
4. `data_retention_log` - Right to erasure tracking
5. `tutor_content` - Content catalog
6. `content_files` - File attachments
7. `content_pricing` - Flexible pricing models
8. `payment_transactions` - Payment history
9. `content_purchases` - Purchase records
10. `content_assignments` - Parent-to-child access
11. `purchase_requests` - Child purchase requests

**Modified Tables (2):**
1. `users` - Added encryption fields, child account support
2. `tutors` - Added Stripe Connect and earnings tracking

**Total Migrations:** 16 (018-033)

### Content Statistics

**Total Content Items:** 26
- **Courses:** 11 (priced $44.99 - $99.99)
- **Lessons:** 6 (priced $9.99 - $19.99)
- **Articles:** 4 (all FREE)
- **Resources:** 3 (2 FREE, 1 at $14.99)
- **Subscriptions:** 4 (priced $24.99 - $29.99/month)

**Free Content:** 9 items (35% of catalog)
**Paid Content:** 17 items (65% of catalog)

### Future Roadmap

**Phase 3: Purchase Flow (Pending)**
- Stripe payment integration
- Purchase processing service
- Access management system
- Subscription handling
- Content delivery

**Phase 4: Content Management (Pending)**
- Tutor dashboard for content upload
- File upload with malware scanning
- Content editor (WYSIWYG)
- Draft/publish workflow
- Analytics dashboard

**Phase 5: Enhanced Features (Pending)**
- Content reviews and ratings
- Content bundles and packages
- Promotional codes and discounts
- Affiliate program
- Content recommendations

### Technical Debt & Improvements

**UI/CSS Refactoring (Planned)**
- **Containerization:** Implement Docker containerization for consistent development and deployment environments
  - Separate containers for frontend, backend, and database
  - Docker Compose for local development
  - Production-ready container orchestration

- **CSS Architecture:** Refactor CSS to use inheritance and component-based styling
  - Create base component styles with inheritance hierarchy
  - Establish shared style classes for common UI patterns (buttons, cards, headers)
  - Reduce CSS duplication across components
  - Implement CSS modules or styled-components for better encapsulation
  - Extract common theme variables and mixins
  - Create reusable utility classes following DRY principles

---

## [0.1.0] - 2025-11-08

### Initial Implementation
- Basic tutor marketplace infrastructure
- Content catalog system
- Security and compliance foundation
