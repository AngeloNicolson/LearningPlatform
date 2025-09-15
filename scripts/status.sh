#!/bin/bash

# Script to check the status of all services

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=================================================="
echo "📊 Debating Platform - Service Status"
echo "=================================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗${NC} Docker is not running. Please start Docker first."
    exit 1
fi

# Check container status
echo "🐳 Docker Containers:"
echo "---------------------"
docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🔍 Service Health Check:"
echo "------------------------"

# Check each service
check_service() {
    local service=$1
    local port=$2
    local url=$3
    
    if docker-compose ps --services --filter "status=running" | grep -q "$service"; then
        echo -e "${GREEN}✓${NC} $service is running"
        
        # Try to connect to the service
        if [ ! -z "$port" ]; then
            if nc -z localhost $port 2>/dev/null; then
                echo -e "  └─ Port $port is accessible"
            else
                echo -e "  └─ ${YELLOW}Port $port is not accessible${NC}"
            fi
        fi
        
        # Check HTTP endpoint if provided
        if [ ! -z "$url" ]; then
            if curl -k -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|302\|304"; then
                echo -e "  └─ Endpoint responding at $url"
            else
                echo -e "  └─ ${YELLOW}Endpoint not responding at $url${NC}"
            fi
        fi
    else
        echo -e "${RED}✗${NC} $service is not running"
    fi
}

check_service "client" "5173" "https://localhost:5173"
check_service "api" "3001" "http://localhost:3001/api/health"
check_service "server" "" ""
check_service "redis" "6379" ""

echo ""
echo "📝 Database Status:"
echo "-------------------"
if docker-compose exec -T server test -f /data/database.db 2>/dev/null; then
    DB_SIZE=$(docker-compose exec -T server du -h /data/database.db 2>/dev/null | cut -f1)
    echo -e "${GREEN}✓${NC} Database exists (Size: $DB_SIZE)"
    
    # Check if database has tables
    TABLE_COUNT=$(docker-compose exec -T server sqlite3 /data/database.db "SELECT COUNT(*) FROM sqlite_master WHERE type='table';" 2>/dev/null || echo "0")
    if [ "$TABLE_COUNT" -gt "0" ]; then
        echo -e "  └─ Database has $TABLE_COUNT tables"
    fi
else
    echo -e "${RED}✗${NC} Database not found"
fi

echo ""
echo "🔗 Quick Links:"
echo "---------------"
echo -e "${BLUE}Frontend:${NC} https://localhost:5173"
echo -e "${BLUE}API:${NC}      http://localhost:3001/api"
echo -e "${BLUE}Redis:${NC}    localhost:6379"

echo ""
echo "💡 Useful Commands:"
echo "-------------------"
echo "View logs:        docker-compose logs -f [service]"
echo "Restart service:  docker-compose restart [service]"
echo "Stop all:         docker-compose down"
echo "Full reset:       npm run docker:reset"

echo ""
echo "=================================================="