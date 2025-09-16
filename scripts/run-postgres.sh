#!/bin/bash

# Script to run PostgreSQL database for local development

echo "🚀 Starting PostgreSQL for Debating Platform"
echo "=================================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Step 1: Stop existing PostgreSQL container if running
echo ""
echo "📦 Cleaning up existing PostgreSQL container..."
docker-compose down postgres 2>/dev/null
docker volume rm debating-platform_postgres_data 2>/dev/null
print_status "Cleaned up existing PostgreSQL"

# Step 2: Start PostgreSQL container
echo ""
echo "🔨 Starting PostgreSQL container..."
docker-compose up -d postgres
if [ $? -ne 0 ]; then
    print_error "Failed to start PostgreSQL"
    exit 1
fi
print_status "Started PostgreSQL container"

# Step 3: Wait for PostgreSQL to be ready
echo ""
echo "⏳ Waiting for PostgreSQL to initialize..."
sleep 10

# Step 4: Verify database is ready
echo ""
echo "🔍 Verifying database connection..."
docker exec tutoring_postgres sh -c "PGPASSWORD=development psql -U postgres -d tutoring_platform -c 'SELECT COUNT(*) as user_count FROM users;'" 2>/dev/null
if [ $? -eq 0 ]; then
    print_status "Database is ready and initialized"
else
    print_warning "Database might still be initializing, please wait a moment"
fi

# Step 5: Show connection info
echo ""
echo "=================================================="
echo "🎉 PostgreSQL is ready!"
echo ""
echo "📍 Database Connection Info:"
echo "   Host:      localhost"
echo "   Port:      5432"
echo "   Database:  tutoring_platform"
echo "   User:      postgres"
echo "   Password:  development"
echo ""
echo "📧 Sample accounts in database:"
echo "   Owner:     owner@tutorplatform.com / password123"
echo "   Admin:     admin@tutorplatform.com / password123"
echo "   Tutor:     sarah.chen@tutors.com / password123"
echo "   Parent:    john.parent@email.com / password123"
echo "   Student:   alex.student@email.com / password123"
echo ""
echo "🛠️  Useful commands:"
echo "   Connect to DB:  docker exec -it tutoring_postgres psql -U postgres -d tutoring_platform"
echo "   View logs:      docker logs tutoring_postgres"
echo "   Stop database:  docker-compose down postgres"
echo "   Reset DB:       docker volume rm debating-platform_postgres_data"
echo ""
echo "=================================================="

# Step 6: Show that we can now run the client locally
echo ""
echo "💻 To run the application locally:"
echo ""
echo "1. Start the API server (in api directory):"
echo "   cd api"
echo "   npm run dev"
echo ""
echo "2. Start the client (in client directory):"
echo "   cd client"
echo "   npm run dev"
echo ""
echo "The API will connect to PostgreSQL at localhost:5432"
echo "=================================================="