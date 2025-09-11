#!/bin/bash

# FLEARN Auth0 Test Environment Setup
# This script sets up the complete testing environment for Auth0 integration

set -e

echo "🔐 FLEARN Auth0 Test Environment Setup"
echo "======================================"

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

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check dependencies
echo -e "${BLUE}📋 Checking dependencies...${NC}"

if ! command_exists docker; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All dependencies found${NC}"

# Start database services
echo -e "${BLUE}🗄️  Starting database services...${NC}"
docker compose up -d postgres mongodb pgadmin mongo-express

# Wait for databases to be ready
echo -e "${YELLOW}⏳ Waiting for databases to be ready...${NC}"
sleep 5

# Check if .env file exists in backend
if [ ! -f "FLEARN-back/.env" ]; then
    echo -e "${YELLOW}📝 Copying environment configuration...${NC}"
    cp .env FLEARN-back/.env
fi

# Start the backend server
echo -e "${BLUE}🚀 Starting FLEARN backend server...${NC}"
cd FLEARN-back

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
    npm install
fi

# Start server in background
npm start &
BACKEND_PID=$!

cd ..

# Wait for server to start
echo -e "${YELLOW}⏳ Waiting for backend server to start...${NC}"
sleep 5

# Test if server is running
if curl -s http://localhost:8099/ > /dev/null; then
    echo -e "${GREEN}✅ Backend server is running on http://localhost:8099${NC}"
else
    echo -e "${RED}❌ Backend server failed to start${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Auth0 Test Environment Ready!${NC}"
echo ""
echo -e "${BLUE}📋 Available Test Commands:${NC}"
echo "  • Basic Auth0 Test:     node ./scripts/test-auth0.js"
echo "  • Token Test:           node ./scripts/test-auth0-token.js"
echo "  • Interactive Test:     python3 -m http.server 8080 --directory scripts/"
echo "                          Then open: http://localhost:8080/auth0-test.html"
echo ""
echo -e "${BLUE}🔗 Service URLs:${NC}"
echo "  • FLEARN API:           http://localhost:8099"
echo "  • PostgreSQL (pgAdmin): http://localhost:8088"
echo "  • MongoDB (Express):    http://localhost:8087"
echo ""
echo -e "${YELLOW}⚠️  To stop the environment:${NC}"
echo "  • Stop backend:         kill $BACKEND_PID"
echo "  • Stop databases:       docker compose down"
echo ""

# Save PID for cleanup
echo $BACKEND_PID > .backend_pid

echo -e "${GREEN}🔐 Auth0 Configuration:${NC}"
echo "  • Domain:     genai-5051199463733487.jp.auth0.com"
echo "  • Audience:   https://FLEARN-api.com"
echo "  • Status:     ✅ Ready for testing"
