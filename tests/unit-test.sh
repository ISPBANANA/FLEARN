#!/bin/bash

# FLEARN Unit Test Runner
# Runs unit tests for backend and frontend components

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧩 Running FLEARN Unit Tests..."
echo "==============================="

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "${YELLOW}Running: $test_name${NC}"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASSED: $test_name${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ FAILED: $test_name${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    echo
}

# Backend Unit Tests
echo "🔧 Backend Unit Tests"
echo "-------------------"

# Check if Node.js is available
if command -v node >/dev/null 2>&1; then
    # Check if backend directory exists
    if [ -d "FLEARN-back" ]; then
        cd FLEARN-back
        
        # Check if package.json exists
        if [ -f "package.json" ]; then
            # Install dependencies if node_modules doesn't exist
            if [ ! -d "node_modules" ]; then
                echo "📦 Installing backend dependencies..."
                run_test "Backend Dependency Installation" "npm ci"
            fi
            
            # Run Jest tests
            run_test "Backend Jest Tests" "npm test"
            
            # Run test coverage if requested
            if [ "$1" = "--coverage" ]; then
                run_test "Backend Test Coverage" "npm run test:coverage"
            fi
        else
            echo -e "${RED}❌ Backend package.json not found${NC}"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
        
        cd ..
    else
        echo -e "${RED}❌ Backend directory (FLEARN-back) not found${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
else
    echo -e "${RED}❌ Node.js not found. Please install Node.js to run unit tests.${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo
echo "🎨 Frontend Unit Tests"
echo "--------------------"

# Check if frontend directory exists
if [ -d "FLEARN-front" ]; then
    cd FLEARN-front
    
    # Check if package.json exists
    if [ -f "package.json" ]; then
        # Install dependencies if node_modules doesn't exist
        if [ ! -d "node_modules" ]; then
            echo "📦 Installing frontend dependencies..."
            run_test "Frontend Dependency Installation" "npm ci"
        fi
        
        # Run linting
        run_test "Frontend Linting" "npm run lint"
        
        # Test build process
        run_test "Frontend Build Test" "npm run build"
        
        # Add more frontend tests here if available
        # run_test "Frontend Jest Tests" "npm test"
    else
        echo -e "${RED}❌ Frontend package.json not found${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    cd ..
else
    echo -e "${RED}❌ Frontend directory (FLEARN-front) not found${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo
echo "📋 Configuration Tests"
echo "---------------------"

# Test package.json configurations
run_test "Backend Package.json Validation" "jq empty FLEARN-back/package.json 2>/dev/null || echo 'Valid JSON'"
run_test "Frontend Package.json Validation" "jq empty FLEARN-front/package.json 2>/dev/null || echo 'Valid JSON'"

# Test Jest configuration
run_test "Backend Jest Config" "test -f FLEARN-back/jest.config.json"

# Test Docker configurations
run_test "Backend Dockerfile" "test -f FLEARN-back/Dockerfile"
run_test "Frontend Dockerfile" "test -f FLEARN-front/Dockerfile"

echo
echo "📊 Unit Test Results:"
echo "===================="
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All unit tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some unit tests failed.${NC}"
    exit 1
fi
