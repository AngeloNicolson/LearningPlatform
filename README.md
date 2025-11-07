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
- Git
- (Optional) mkcert for browser-trusted HTTPS certificates

### Setup Instructions

1. Clone the repo and cd into it
   ```bash
   git clone <repository-url>
   cd Debating-platform
   ```

2. **(Optional)** Generate HTTPS certificates with mkcert for trusted local HTTPS

   If you want browser-trusted certificates, install mkcert first:
   ```bash
   # On Mac
   brew install mkcert

   # On Linux
   sudo apt install libnss3-tools
   wget https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64
   chmod +x mkcert-v1.4.4-linux-amd64
   sudo mv mkcert-v1.4.4-linux-amd64 /usr/local/bin/mkcert
   ```

   Then generate certificates:
   ```bash
   npm run setup:https
   ```

   **Note:** If you skip this step, Docker will automatically generate self-signed certificates when it starts. Self-signed certs work fine but your browser will show a security warning.

3. Start everything with Docker
   ```bash
   docker compose up
   ```

   This starts:
   - React frontend (https://localhost:5777)
   - Express API (https://localhost:3777)
   - PostgreSQL database (runs migrations automatically on first startup)
   - Redis for sessions
   - **HTTPS certificates are auto-generated** if not found

   **Important:** Migrations only run automatically the FIRST time when the database is empty. If you've already started Docker before, you'll need to run migrations manually with `docker-compose exec api npm run migrate` or reset everything with `docker compose down -v && docker compose up`.

4. Open https://localhost:5777 in your browser

   If using self-signed certificates, you'll need to accept the browser security warning.

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

6. Go to http://localhost:5777 (or https://localhost:5777 if you configured certificates)

**Note:** For HTTPS in local dev, you can either:
   - Run `npm run setup:https` to generate mkcert certificates, then set `USE_HTTPS=true` and `CERT_KEY_PATH=./certs/localhost-key.pem` and `CERT_PATH=./certs/localhost.pem` in `api/.env`
   - Or just use HTTP for local development (recommended for simplicity)

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
- For Docker: This is normal with auto-generated self-signed certificates. To remove the warning, run `npm run setup:https` before starting Docker to use mkcert-trusted certificates.
- For local dev: Run `mkcert -install` then `npm run setup:https`

**API falls back to HTTP even with USE_HTTPS=true:**
- Check the API logs for certificate path errors
- For Docker: Certificates auto-generate, check `docker-compose logs api` for details
- For local dev: Make sure you've set `CERT_KEY_PATH` and `CERT_PATH` in `api/.env` to relative paths (e.g., `./certs/localhost-key.pem`)

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
- **Docker:** HTTPS works automatically! Certificates are auto-generated on first startup if not found. For browser-trusted certificates (no security warnings), run `npm run setup:https` before starting Docker.
- **Local dev (without Docker):** Set environment variables in `api/.env`:
  - `USE_HTTPS=true`
  - `CERT_KEY_PATH=./certs/localhost-key.pem`
  - `CERT_PATH=./certs/localhost.pem`
  - Then run `npm run setup:https` to generate certificates
- **Certificate paths are now configurable** via environment variables (`CERT_KEY_PATH` and `CERT_PATH`), making it easy to switch between Docker and local development

**Other:**
- The default theme is a light beige/burgundy color scheme
- Test accounts are seeded in the database (owner, admin, teacher, student)
- Secure cookies require HTTPS to work properly