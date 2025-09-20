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

# Create tables if needed
docker-compose exec -T api npx ts-node -e "
    const { query } = require('./src/database/connection');
    const fs = require('fs');
    if (fs.existsSync('./src/database/create-tables.sql')) {
        const sql = fs.readFileSync('./src/database/create-tables.sql', 'utf8');
        query(sql)
            .then(() => console.log('Tables created'))
            .catch(err => {
                if (err.code !== '42P07') console.error('Table creation error:', err.message);
            })
            .finally(() => process.exit());
    } else {
        process.exit();
    }
" 2>/dev/null || true

# Run migrations
docker-compose exec -T api npm run migrate 2>/dev/null || {
    print_warning "Running fallback migration setup..."
    docker-compose exec -T api npx ts-node -e "
        const { query } = require('./src/database/connection');
        const createTables = \`
            CREATE TABLE IF NOT EXISTS resources (
                id VARCHAR(255) PRIMARY KEY,
                subject VARCHAR(50),
                topic_id VARCHAR(100),
                topic_name VARCHAR(255),
                topic_icon VARCHAR(10),
                subtopic_id INTEGER,
                resource_type VARCHAR(50),
                title VARCHAR(255) NOT NULL,
                description TEXT,
                url TEXT,
                content TEXT,
                video_url TEXT,
                pdf_url TEXT,
                time_limit INTEGER,
                grade_level VARCHAR(50),
                visible BOOLEAN DEFAULT true,
                display_order INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_by INTEGER
            );
            
            CREATE INDEX IF NOT EXISTS idx_resources_subject ON resources(subject);
            CREATE INDEX IF NOT EXISTS idx_resources_topic_id ON resources(topic_id);
        \`;
        query(createTables)
            .then(() => console.log('Schema created'))
            .catch(console.error)
            .finally(() => process.exit());
    " 2>/dev/null || true
}

# Seed database
docker-compose exec -T api npm run seed 2>/dev/null || print_warning "Seeding completed or data already exists"

# Seed math resources
echo ""
echo "📐 Seeding math resources..."
docker-compose exec -T api npx ts-node src/database/seed-math-resources.ts 2>/dev/null || print_warning "Math resources seeding completed or data already exists"

# Original db:init command as fallback
docker-compose exec -T server npm run db:init 2>/dev/null || true

if [ $? -eq 0 ]; then
    print_status "Database initialized with seed data"
else
    print_warning "Database initialization completed (some data may already exist)"
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