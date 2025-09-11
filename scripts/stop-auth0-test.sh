#!/bin/bash

# FLEARN Auth0 Test Environment Cleanup
# This script stops all Auth0 test environment components

set -e

echo "🛑 FLEARN Auth0 Test Environment Cleanup"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Error: Please run this script from the FLEARN root directory${NC}"
    exit 1
fi

# Stop backend server if PID file exists
if [ -f ".backend_pid" ]; then
    BACKEND_PID=$(cat .backend_pid)
    echo -e "${BLUE}🔄 Stopping backend server (PID: $BACKEND_PID)...${NC}"
    
    if kill $BACKEND_PID 2>/dev/null; then
        echo -e "${GREEN}✅ Backend server stopped${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend server was not running or already stopped${NC}"
    fi
    
    rm -f .backend_pid
else
    echo -e "${YELLOW}⚠️  No backend PID file found, checking for running processes...${NC}"
    
    # Try to find and kill any running node processes for the backend
    PIDS=$(ps aux | grep "node index.js" | grep -v grep | awk '{print $2}' || true)
    if [ ! -z "$PIDS" ]; then
        echo -e "${BLUE}🔄 Found running backend processes, stopping them...${NC}"
        echo $PIDS | xargs kill 2>/dev/null || true
        echo -e "${GREEN}✅ Backend processes stopped${NC}"
    fi
fi

# Stop Docker services
echo -e "${BLUE}🗄️  Stopping database services...${NC}"
docker compose down

echo -e "${GREEN}✅ All database services stopped${NC}"

# Check for any remaining processes
echo -e "${BLUE}🔍 Checking for remaining processes...${NC}"
REMAINING=$(ss -tlnp | grep ":8099" || true)
if [ ! -z "$REMAINING" ]; then
    echo -e "${YELLOW}⚠️  Port 8099 is still in use:${NC}"
    echo "$REMAINING"
else
    echo -e "${GREEN}✅ Port 8099 is free${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Auth0 Test Environment Cleanup Complete!${NC}"
echo ""
echo -e "${BLUE}📋 Environment Status:${NC}"
echo "  • Backend Server:       ⏹️  Stopped"
echo "  • Database Services:    ⏹️  Stopped"
echo "  • Docker Containers:    ⏹️  Stopped"
echo ""
echo -e "${BLUE}🔄 To restart the environment:${NC}"
echo "  ./scripts/start-auth0-test.sh"
