# Learning Platform

My project for building an online tutoring platform for math, science, and other subjects. Started as a debating platform but pivoted to focus on education resources.

## What it does

This is a web app where students can find tutors and learning materials for different subjects. Right now it has math worksheets, science resources, and Bible studies organized by grade level.

Built with React for the frontend and Express/Node.js for the backend. Uses PostgreSQL for the database.

## Tech Stack

- Frontend: React with TypeScript
- Backend: Express.js API
- Database: PostgreSQL
- Authentication: JWT tokens with secure cookies
- Running it all in Docker containers for easier setup

## Getting Started

### You'll need:
- Docker and Docker Compose installed
- mkcert for HTTPS certificates
- Git

### Setup Instructions

1. Clone the repo and cd into it
   ```bash
   git clone <repository-url>
   cd Debating-platform
   ```

2. Install mkcert (first time only)
   ```bash
   # On Mac
   brew install mkcert

   # On Linux
   sudo apt install libnss3-tools
   wget https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64
   chmod +x mkcert-v1.4.4-linux-amd64
   sudo mv mkcert-v1.4.4-linux-amd64 /usr/local/bin/mkcert
   ```

3. Generate HTTPS certs (needed for secure cookies)
   ```bash
   npm run setup:https
   ```

4. Start everything with Docker
   ```bash
   docker compose up
   ```

   This starts:
   - React frontend
   - Express API
   - PostgreSQL database (runs migrations automatically on first startup)
   - Redis for sessions

   **Important:** Migrations only run automatically the FIRST time when the database is empty. If you've already started Docker before, you'll need to run migrations manually with `docker-compose exec api npm run migrate` or reset everything with `docker compose down -v && docker compose up`.

5. Open https://localhost:5777 in your browser

   Login with test accounts:
   - Owner: owner@example.com / Owner123!
   - Admin: admin@example.com / Admin123!
   - Teacher: teacher@example.com / Teacher123!
   - Student: student@example.com / Student123!

### Useful Docker commands

```bash
# Start everything
docker compose up

# Run in background
docker compose up -d

# See logs
docker compose logs -f

# Stop everything
docker compose down

# Reset database (deletes all data!)
docker compose down -v

# Rebuild from scratch if something breaks
docker compose down -v && docker compose build --no-cache && docker compose up
```

## Running locally without Docker

If you want to run it directly on your machine:

1. Install Node.js 18+ and PostgreSQL 15+

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a postgres database called `tutoring_platform`

4. Run migrations
   ```bash
   cd api
   npm run migrate
   cd ..
   ```

5. Start the dev servers
   ```bash
   npm run dev
   ```

6. Go to http://localhost:5777 (or https if you fix the cert paths)

**Note:** HTTPS won't work in local dev without modifying `api/src/index.ts` to use relative cert paths instead of `/app/certs/`. For now, just use HTTP locally or run with Docker.

## Project Structure

```
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
├── api/             # Express backend
│   ├── src/
│   │   ├── routes/
│   │   └── database/migrations/
├── shared/          # Shared TypeScript types
└── certs/           # HTTPS certificates
```

## Features

- User authentication with JWT tokens
- Math worksheets organized by grade level
- Science resources
- Bible study materials
- Admin panel for managing content
- Secure HTTPS connections
- Video embedding (YouTube/Vimeo)
- File upload for worksheets
- Topics filtering and search

## API Routes

Main endpoints:
- `/api/auth/*` - Authentication (register, login, logout, refresh)
- `/api/tutors` - Tutors list and details
- `/api/bookings` - Create and manage tutoring bookings
- `/api/teachers` - Teacher info
- `/api/users` - User management
- `/api/subjects` - Subjects and subject levels
- `/api/resources` - Learning resources by subject
- `/api/topics` - Topics filtering
- `/api/uploads` - File uploads (worksheets, videos)
- `/api/downloads` - Download tracking
- `/api/site-data` - Site statistics
- `/api/admin/subjects` - Admin panel for managing subjects/topics

## Dev Commands

```bash
# Run both frontend and backend
npm run dev

# Run just frontend
npm run dev:client

# Run just backend
npm run dev:api

# Build for production
npm run build
```

## Common Issues

**Certificate warnings in browser:**
Run `mkcert -install` then regenerate certs with `npm run setup:https`

**Permission errors:**
Try `sudo rm -rf client/node_modules/.vite` then restart

**Port already in use:**
Kill the process: `lsof -ti:3777 | xargs kill -9` or `lsof -ti:5777 | xargs kill -9`

**Database connection errors:**
Make sure PostgreSQL is running and the database exists. For Docker, check `docker-compose logs postgres`. For local dev, check if postgres service is running.

**Missing database tables:**
Run migrations: `docker-compose exec api npm run migrate` (Docker) or `cd api && npm run migrate` (local)

**Docker not working:**
Reset everything: `docker compose down -v && docker compose up`

## Environment Setup

**For local development (without Docker):**

Create a `.env` file in the `api/` directory with:
```
PORT=3777
USE_HTTPS=false
JWT_ACCESS_SECRET=your-access-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
DB_HOST=localhost
DB_NAME=tutoring_platform
DB_USER=postgres
DB_PASSWORD=your-postgres-password
CLIENT_URL=http://localhost:5777
```

**For Docker:**
Environment variables are set in docker-compose.yml, so you don't need a .env file. Docker uses `DB_HOST=postgres` (container name) and `USE_HTTPS=true`.

## Notes

**Database Migrations:**
- Migrations run automatically on FIRST Docker startup (when postgres_data volume is empty)
- If you restart Docker with existing data, migrations won't re-run
- To run migrations manually: `docker-compose exec api npm run migrate`
- To reset and re-run all migrations: `docker compose down -v && docker compose up`

**HTTPS Setup:**
- Docker: Works out of the box, certs are mounted from `./certs` to `/app/certs`
- Local dev (without Docker): The API code uses hardcoded `/app/certs/` paths, so it will fall back to HTTP even if you have certs. You'd need to change the cert paths in `api/src/index.ts` to use relative paths like `./certs/` for local dev to work with HTTPS.

**Other:**
- The default theme is a light beige/burgundy color scheme
- Test accounts are seeded in the database (owner, admin, teacher, student)
- Secure cookies require HTTPS to work properly