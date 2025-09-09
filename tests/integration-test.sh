#!/bin/bash

# FLEARN Comprehensive Test Script
# This script runs comprehensive tests on the FLEARN application

set -e

echo "🧪 Starting FLEARN Comprehensive Tests..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "${YELLOW}Running: $test_name${NC}"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASSED: $test_name${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ FAILED: $test_name${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    echo
}

# Function to wait for service
wait_for_service() {
    local service_name="$1"
    local url="$2"
    local max_attempts="${3:-30}"
    
    echo "⏳ Waiting for $service_name to be ready..."
    
    for i in $(seq 1 $max_attempts); do
        if curl -f "$url" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is ready!${NC}"
            return 0
        fi
        echo "   Attempt $i/$max_attempts..."
        sleep 2
    done
    
    echo -e "${RED}❌ $service_name failed to start within $((max_attempts * 2)) seconds${NC}"
    return 1
}

echo "🏗️  Building and starting services..."

# Stop any existing containers
docker compose down -v >/dev/null 2>&1 || true

# Build with cache busting
export CACHEBUST=$(date +%s)
docker compose build --no-cache --build-arg CACHEBUST=$CACHEBUST

# Start services
docker compose up -d

echo "⏳ Waiting for services to initialize..."
sleep 10

# Test 1: Check if containers are running
run_test "Container Status Check" "docker compose ps | grep -E '(Up|healthy)'"

# Test 2: Wait for and test backend health
run_test "Backend Health Check" "wait_for_service 'Backend API' 'http://localhost:8099/health'"

# Test 3: Wait for and test frontend
run_test "Frontend Accessibility" "wait_for_service 'Frontend' 'http://localhost:3000'"

# Test 4: Wait for and test webhook service
run_test "Webhook Service Health" "wait_for_service 'Webhook Service' 'http://localhost:3001/health'"

# Test 5: Test webhook service security
run_test "Webhook Security Test" "curl -s -w '%{http_code}' -o /dev/null -X POST http://localhost:3001/webhook -H 'Content-Type: application/json' -d '{\"test\": \"data\"}' | grep -q '403'"

# Test 6: Test PostgreSQL connectivity
run_test "PostgreSQL Connection" "docker compose exec -T postgres pg_isready -U flearn_user -d flearn_db"

# Test 7: Test MongoDB connectivity
run_test "MongoDB Connection" "docker compose exec -T mongodb mongosh --quiet --eval 'db.adminCommand(\"ping\").ok == 1'"

# Test 8: Test backend API endpoints
run_test "Backend Root Endpoint" "curl -f http://localhost:8099/ | grep -q 'FLEARN Backend API'"

# Test 9: Test backend API response format
run_test "Backend API JSON Response" "curl -f http://localhost:8099/health | jq -e '.status == \"OK\"'"

# Test 10: Test CORS headers
run_test "CORS Headers Check" "curl -H 'Origin: http://localhost:3000' -H 'Access-Control-Request-Method: GET' -H 'Access-Control-Request-Headers: X-Requested-With' -X OPTIONS http://localhost:8099/health"

# Test 11: Test 404 handling
run_test "404 Error Handling" "curl -f http://localhost:8099/nonexistent 2>/dev/null | jq -e '.message' | grep -q 'not found' || test $? -eq 22"

# Test 12: Check database volumes
run_test "Database Volumes" "docker volume ls | grep -E '(postgres_data|mongodb_data)'"

# Test 13: Check network connectivity
run_test "Network Connectivity" "docker network ls | grep flearn_network"

# Test 14: Memory usage check
run_test "Memory Usage Check" "docker stats --no-stream --format 'table {{.Container}}\t{{.MemUsage}}' | grep -E '(flearn_backend|flearn_frontend|flearn_webhook)'"

echo "🧹 Cleaning up..."
docker compose down -v

echo
echo "📊 Test Results Summary:"
echo "=========================="
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed! FLEARN is working correctly.${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed. Please check the logs above.${NC}"
    exit 1
fi
