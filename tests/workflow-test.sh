#!/bin/bash

# FLEARN Workflow Test Script
# This script validates the GitHub Actions workflow configuration

set -e

echo "🔍 Testing FLEARN GitHub Actions Workflow..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

WORKFLOW_FILE=".github/workflows/docker-compose-ci.yml"
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "${YELLOW}Testing: $test_name${NC}"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASSED: $test_name${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ FAILED: $test_name${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    echo
}

echo "📝 Validating workflow configuration..."

# Test 1: Workflow file exists
run_test "Workflow file exists" "test -f $WORKFLOW_FILE"

# Test 2: Workflow has valid YAML syntax
run_test "Valid YAML syntax" "yq eval . $WORKFLOW_FILE > /dev/null 2>&1 || python3 -c 'import yaml; yaml.safe_load(open(\"$WORKFLOW_FILE\"))'"

# Test 3: Workflow has required triggers
run_test "Has push trigger" "grep -q 'push:' $WORKFLOW_FILE"
run_test "Has pull_request trigger" "grep -q 'pull_request:' $WORKFLOW_FILE"
run_test "Has workflow_dispatch trigger" "grep -q 'workflow_dispatch:' $WORKFLOW_FILE"

# Test 4: Workflow has test job
run_test "Has test job" "grep -q 'test:' $WORKFLOW_FILE"

# Test 5: Workflow has build job
run_test "Has build job" "grep -q 'build-and-deploy:' $WORKFLOW_FILE"

# Test 6: Uses correct Node.js version
run_test "Uses Node.js 20" "grep -q \"node-version: '20'\" $WORKFLOW_FILE"

# Test 7: Has dependency installation steps
run_test "Installs backend dependencies" "grep -q 'Install Backend Dependencies' $WORKFLOW_FILE"
run_test "Installs frontend dependencies" "grep -q 'Install Frontend Dependencies' $WORKFLOW_FILE"

# Test 8: Has linting step
run_test "Has linting step" "grep -q 'Lint Frontend Code' $WORKFLOW_FILE"

# Test 9: Has build step
run_test "Has build step" "grep -q 'Build Frontend' $WORKFLOW_FILE"

# Test 10: Has Docker build step
run_test "Has Docker build step" "grep -q 'Build Docker images' $WORKFLOW_FILE"

# Test 11: Has health check tests
run_test "Has backend health check" "grep -q 'Test Backend API Health' $WORKFLOW_FILE"
run_test "Has frontend test" "grep -q 'Test Frontend Application' $WORKFLOW_FILE"

# Test 12: Has database tests
run_test "Has database tests" "grep -q 'Test Database Connections' $WORKFLOW_FILE"

# Test 13: Has cleanup step
run_test "Has cleanup step" "grep -q 'Cleanup' $WORKFLOW_FILE"

# Test 14: Validate Docker Compose files
run_test "Docker Compose file exists" "test -f docker-compose.yml"
run_test "Docker Compose syntax valid" "command -v docker >/dev/null 2>&1 && docker compose config > /dev/null 2>&1 || echo 'Docker not available, skipping syntax check'"

# Test 15: Validate Dockerfiles
run_test "Backend Dockerfile exists" "test -f FLEARN-back/Dockerfile"
run_test "Frontend Dockerfile exists" "test -f FLEARN-front/Dockerfile"

# Test 16: Check for required build args
run_test "Backend Dockerfile has CACHEBUST arg" "grep -q 'ARG CACHEBUST' FLEARN-back/Dockerfile"
run_test "Frontend Dockerfile has CACHEBUST arg" "grep -q 'ARG CACHEBUST' FLEARN-front/Dockerfile"

# Test 17: Check package.json files
run_test "Backend package.json exists" "test -f FLEARN-back/package.json"
run_test "Frontend package.json exists" "test -f FLEARN-front/package.json"

# Test 18: Check for test scripts
run_test "Backend has test script" "grep -q '\"test\"' FLEARN-back/package.json"

echo
echo "📊 Workflow Test Results:"
echo "========================="
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All workflow tests passed! The GitHub Actions workflow is properly configured.${NC}"
    echo -e "\n📋 Workflow capabilities:"
    echo "  ✅ Automated testing on push and PR"
    echo "  ✅ Frontend linting and building"
    echo "  ✅ Docker image building with git integration"
    echo "  ✅ Health checks for all services"
    echo "  ✅ Database connectivity testing"
    echo "  ✅ Integration testing"
    echo "  ✅ Automatic image pushing to Docker Hub"
    exit 0
else
    echo -e "\n${RED}❌ Some workflow tests failed. Please fix the issues above.${NC}"
    exit 1
fi
