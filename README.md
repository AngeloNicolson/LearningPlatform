# Debating Platform - Mathematical Tutoring & Education

A modern platform for mathematical tutoring and debating with secure authentication, payment processing, and enterprise-grade security.

## 🏗️ Architecture

- **Client**: React + TypeScript + Vite (HTTPS enabled)
- **API**: Express.js REST API with JWT authentication
- **Server**: Backend services with SQLite database
- **Shared**: Common TypeScript types and interfaces
- **Security**: HTTPS, JWT tokens, secure cookies, rate limiting

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose (optional)
- mkcert (for HTTPS setup)
- Git

### Setup

1. **Clone and navigate to project**:
   ```bash
   git clone <repository-url>
   cd Debating-platform
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up HTTPS** (Required for secure authentication):
   ```bash
   # Install mkcert
   # macOS: brew install mkcert
   # Linux: Follow https://github.com/FiloSottile/mkcert#installation
   
   # Generate certificates
   cd client
   npm run setup:https
   cd ..
   ```

4. **Initialize database**:
   ```bash
   npm run db:init
   ```

5. **Start development servers**:
   ```bash
   npm run dev
   ```

6. **Access the application**:
   - Frontend: https://localhost:5173 (HTTPS)
   - API: http://localhost:3001/api
   - Demo login: demo@example.com / Demo123!

### Development

- **View logs**: `docker-compose logs -f [service-name]`
- **Stop services**: `docker-compose down`
- **Rebuild**: `docker-compose up --build`
- **Database reset**: `docker-compose down -v && docker-compose up --build`

## 📁 Project Structure

```
├── client/                  # React frontend (HTTPS)
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── contexts/       # React contexts
│   │   └── services/       # API client
│   ├── certs/             # HTTPS certificates (generated)
│   └── public/
├── api/                    # Express REST API
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   └── middleware/    # Auth & security
│   └── Dockerfile
├── server/                 # Backend services
│   ├── src/
│   │   ├── database/      # SQLite setup
│   │   └── services/      # Business logic
│   └── Dockerfile
├── shared/                 # Shared types
│   └── src/types/
├── package.json           # Root workspace config
└── docker-compose.yml     # Service orchestration
```

## 🔧 Features

### ✅ Current Implementation
- **HTTPS enabled** for secure connections
- **JWT authentication** with refresh token rotation
- **Secure HTTP-only cookies** for token storage
- **Mathematical tutoring** system with booking
- **Grade-based resources** (Elementary to College)
- **Stripe payment** integration ready
- **Light tofu theme** with burgundy accents
- **Docker deployment** with hot reloading

### 🔒 Security Features
- Rate limiting on all endpoints
- Password hashing with bcrypt
- CSRF protection
- Security headers via Helmet.js
- Input validation and sanitization
- SQL injection prevention
- Audit logging for security events
- Account lockout after failed attempts

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh tokens
- `POST /api/auth/logout` - Logout

### Tutors
- `GET /api/tutors` - List tutors
- `GET /api/tutors/:id` - Get tutor details
- `GET /api/tutors/:id/availability` - Get availability

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - User's bookings
- `DELETE /api/bookings/:id` - Cancel booking
- `POST /api/bookings/:id/confirm` - Confirm payment

## 🛠️ Development

### Start All Services
```bash
npm run dev
```

### Individual Services
```bash
npm run dev:client   # Frontend (https://localhost:5173)
npm run dev:api      # API (http://localhost:3001)
npm run dev:server   # Backend services
```

### Database Operations
```bash
# Initialize database
npm run db:init

# Access SQLite database
sqlite3 server/database.db
```

### Build for Production
```bash
npm run build
```

## 🔒 Environment Variables

### API (.env)
```
NODE_ENV=development
PORT=3001
CLIENT_URL=https://localhost:5173
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
DATABASE_PATH=/data/database.db
```

### Client (.env)
```
VITE_API_URL=https://localhost:3001/api
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

## 🐳 Docker Services

- **client**: React frontend with HTTPS support
- **api**: Express REST API with JWT auth
- **server**: Backend services with SQLite database
- **redis**: Session management (optional)

## 🚢 Using Docker

```bash
# Start all services
docker-compose up

# Build and start
docker-compose up --build

# Stop services
docker-compose down
```

## 🔐 Authentication Flow

1. User registers/logs in via HTTPS
2. Server validates credentials
3. JWT tokens stored in secure cookies
4. Access token (15min) for API requests
5. Refresh token (7days) for renewal
6. Automatic token rotation

---

**Ready to start?** 🎯

Run `npm run dev` and visit https://localhost:5173