#!/bin/bash

# Start the entire development environment with one command
# This script:
# 1. Starts PostgreSQL via Docker
# 2. Waits for it to be ready
# 3. Runs database migrations
# 4. Starts the API and client dev servers

set -e

echo "🚀 Starting development environment..."
echo ""

# Start PostgreSQL in Docker
echo "📦 Starting PostgreSQL..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 3

# Check if postgres is actually ready
until docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
  echo "   Still waiting for PostgreSQL..."
  sleep 2
done

echo "✅ PostgreSQL is ready!"
echo ""

# Run migrations
echo "🔄 Running database migrations..."
cd api && npm run migrate && cd ..
echo ""

# Start dev servers
echo "🎯 Starting API and Client dev servers..."
echo ""
npm run dev
