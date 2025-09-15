#!/bin/bash

# Script to fully reset and start the development environment

echo "🚀 Starting Debating Platform Development Environment"
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

# Step 1: Stop and remove existing containers
echo ""
echo "📦 Cleaning up Docker environment..."
docker-compose down -v 2>/dev/null
if [ $? -eq 0 ]; then
    print_status "Stopped and removed existing containers"
else
    print_warning "No existing containers to remove"
fi

# Step 2: Remove any orphaned containers and volumes
docker container prune -f 2>/dev/null
docker volume prune -f 2>/dev/null
print_status "Cleaned up orphaned containers and volumes"

# Step 3: Check if certificates exist, create if needed
echo ""
echo "🔒 Checking HTTPS certificates..."
if [ ! -f "certs/localhost.pem" ] || [ ! -f "certs/localhost-key.pem" ]; then
    print_warning "Certificates not found"
    if command -v mkcert &> /dev/null; then
        print_status "mkcert found, generating certificates..."
        bash scripts/setup-https.sh
        print_status "Generated HTTPS certificates"
    else
        print_warning "mkcert not installed - Application will run on HTTP only"
        echo ""
        echo "   To enable HTTPS, install mkcert:"
        echo "   - Ubuntu/Debian: sudo apt install libnss3-tools && brew install mkcert"
        echo "   - Arch: sudo pacman -S nss && brew install mkcert"
        echo "   - macOS: brew install mkcert"
        echo "   - Or download from: https://github.com/FiloSottile/mkcert/releases"
        echo ""
        echo "   After installing mkcert, run: npm run setup:https"
        echo ""
        # Create empty cert directory to prevent mount errors
        mkdir -p certs
        touch certs/.gitkeep
    fi
else
    print_status "HTTPS certificates found"
fi

# Step 4: Build and start containers
echo ""
echo "🔨 Building Docker containers..."
docker-compose build --no-cache
if [ $? -ne 0 ]; then
    print_error "Failed to build containers"
    exit 1
fi
print_status "Built Docker containers"

# Step 5: Start containers
echo ""
echo "🚀 Starting containers..."
docker-compose up -d
if [ $? -ne 0 ]; then
    print_error "Failed to start containers"
    exit 1
fi
print_status "Started all containers"

# Step 6: Wait for services to be ready
echo ""
echo "⏳ Waiting for services to initialize..."
sleep 5

# Step 7: Initialize database
echo ""
echo "🗄️  Initializing database..."
docker-compose exec -T server npm run db:init
if [ $? -eq 0 ]; then
    print_status "Database initialized with seed data"
else
    print_warning "Database initialization had issues (may already be initialized)"
fi

# Step 8: Show service status
echo ""
echo "=================================================="
echo "📊 Service Status:"
echo ""
docker-compose ps

# Step 9: Display access URLs
echo ""
echo "=================================================="
echo "🎉 Development environment is ready!"
echo ""
echo "📍 Access the application at:"
if [ -f "certs/localhost.pem" ] && [ -f "certs/localhost-key.pem" ]; then
    echo "   Frontend:  https://localhost:5173 (HTTPS)"
else
    echo "   Frontend:  http://localhost:5173 (HTTP only)"
fi
echo "   API:       http://localhost:3001/api"
echo "   Redis:     localhost:6379"
echo ""
echo "📧 Login credentials:"
echo "   Owner:    owner@example.com / Owner123!"
echo "   Admin:    admin@example.com / Admin123!"
echo "   Teacher:  teacher@example.com / Teacher123!"
echo "   Student:  student@example.com / Student123!"
echo ""
echo "🛠️  Useful commands:"
echo "   View logs:     docker-compose logs -f [service]"
echo "   Stop services: docker-compose down"
echo "   Restart:       docker-compose restart [service]"
echo "   Shell access:  docker-compose exec [service] sh"
echo ""
echo "=================================================="

# Step 10: Verify services are running
echo ""
echo "🔍 Verifying services..."
sleep 2

# Check if services are healthy
CLIENT_STATUS=$(docker-compose ps --services --filter "status=running" | grep -c client || echo 0)
API_STATUS=$(docker-compose ps --services --filter "status=running" | grep -c api || echo 0)
SERVER_STATUS=$(docker-compose ps --services --filter "status=running" | grep -c server || echo 0)

if [ "$CLIENT_STATUS" -eq 1 ] && [ "$API_STATUS" -eq 1 ] && [ "$SERVER_STATUS" -eq 1 ]; then
    print_status "All services are running successfully!"
    echo ""
    echo "🌐 Services are running in the background (detached mode)"
    echo "   They will continue running even after this script exits."
else
    print_error "Some services failed to start. Check logs with: docker-compose logs"
fi

# Step 11: Follow logs (optional)
echo ""
read -p "Would you like to follow the logs? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Press Ctrl+C to stop following logs (services will keep running)"
    docker-compose logs -f
else
    echo ""
    echo "✅ Services are running in the background!"
    echo "   To view logs later: docker-compose logs -f"
    echo "   To stop services: docker-compose down"
fi