#!/bin/bash

# Test script for FLEARN webhook system

echo "🧪 Testing FLEARN Webhook System"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
    local url=$1
    local expected_status=$2
    local description=$3
    local method=${4:-GET}
    
    echo -n "Testing $description... "
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "%{http_code}" -o /dev/null -X POST "$url" -H "Content-Type: application/json" -d '{"test": "data"}' 2>/dev/null)
    else
        response=$(curl -s -w "%{http_code}" -o /dev/null "$url" 2>/dev/null)
    fi
    
    if [ "$response" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $response)"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $response, expected $expected_status)"
        return 1
    fi
}

# Test if webhook service is running
echo "🔍 Checking webhook service..."
if docker compose ps webhook-service | grep -q "Up"; then
    echo -e "${GREEN}✅ Webhook service is running${NC}"
else
    echo -e "${RED}❌ Webhook service is not running${NC}"
    echo "Starting webhook service..."
    docker compose up -d webhook-service
    sleep 5
fi

echo ""

# Test health endpoint
test_endpoint "http://localhost:3001/health" 200 "Health endpoint"

# Test webhook endpoint (should return 403 without proper signature)
test_endpoint "http://localhost:3001/webhook" 403 "Webhook endpoint security" "POST"

echo ""
echo "📊 Service Status:"
docker compose ps webhook-service

echo ""
echo "📝 Recent webhook logs:"
docker compose logs --tail=10 webhook-service

echo ""
echo "🎯 Next Steps:"
echo "1. Configure GitHub webhook in your repository"
echo "2. Push changes to main branch to test automatic deployment"
echo "3. Monitor logs: docker compose logs -f webhook-service"
echo "4. Check deployment logs: tail -f logs/deployment.log"
