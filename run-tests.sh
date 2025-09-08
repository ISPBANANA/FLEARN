#!/bin/bash

# FLEARN Test Runner
# Main script to run all tests for the FLEARN project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
TOTAL_SUITES=0
PASSED_SUITES=0
FAILED_SUITES=0

echo -e "${BLUE}🧪 FLEARN Test Suite Runner${NC}"
echo "=================================="
echo

# Function to run a test suite
run_test_suite() {
    local suite_name="$1"
    local script_path="$2"
    local description="$3"
    
    echo -e "${YELLOW}📋 Running: $suite_name${NC}"
    echo "   $description"
    echo
    
    TOTAL_SUITES=$((TOTAL_SUITES + 1))
    
    if [ -f "$script_path" ]; then
        if bash "$script_path"; then
            echo -e "${GREEN}✅ PASSED: $suite_name${NC}"
            PASSED_SUITES=$((PASSED_SUITES + 1))
        else
            echo -e "${RED}❌ FAILED: $suite_name${NC}"
            FAILED_SUITES=$((FAILED_SUITES + 1))
        fi
    else
        echo -e "${RED}❌ FAILED: $suite_name (Script not found: $script_path)${NC}"
        FAILED_SUITES=$((FAILED_SUITES + 1))
    fi
    
    echo
    echo "----------------------------------------"
    echo
}

# Parse command line arguments
RUN_ALL=true
QUICK_MODE=false
INTEGRATION_ONLY=false
WORKFLOW_ONLY=false
UNIT_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --quick|-q)
            QUICK_MODE=true
            INTEGRATION_ONLY=false
            WORKFLOW_ONLY=false
            UNIT_ONLY=false
            shift
            ;;
        --integration|-i)
            INTEGRATION_ONLY=true
            QUICK_MODE=false
            WORKFLOW_ONLY=false
            UNIT_ONLY=false
            shift
            ;;
        --workflow|-w)
            WORKFLOW_ONLY=true
            QUICK_MODE=false
            INTEGRATION_ONLY=false
            UNIT_ONLY=false
            shift
            ;;
        --unit|-u)
            UNIT_ONLY=true
            QUICK_MODE=false
            INTEGRATION_ONLY=false
            WORKFLOW_ONLY=false
            shift
            ;;
        --help|-h)
            echo "FLEARN Test Runner Usage:"
            echo "  ./run-tests.sh [OPTIONS]"
            echo
            echo "Options:"
            echo "  --quick, -q         Run quick tests only (workflow validation)"
            echo "  --integration, -i   Run integration tests only"
            echo "  --workflow, -w      Run workflow tests only"
            echo "  --unit, -u          Run unit tests only"
            echo "  --help, -h          Show this help message"
            echo
            echo "Examples:"
            echo "  ./run-tests.sh                  # Run all tests"
            echo "  ./run-tests.sh --quick          # Quick validation"
            echo "  ./run-tests.sh --integration    # Full integration tests"
            echo "  ./run-tests.sh --workflow       # Workflow validation only"
            echo "  ./run-tests.sh --unit           # Unit tests only"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Show selected test mode
if [ "$QUICK_MODE" = true ]; then
    echo -e "${BLUE}🚀 Running in QUICK mode (workflow validation only)${NC}"
elif [ "$INTEGRATION_ONLY" = true ]; then
    echo -e "${BLUE}🔧 Running INTEGRATION tests only${NC}"
elif [ "$WORKFLOW_ONLY" = true ]; then
    echo -e "${BLUE}⚙️  Running WORKFLOW tests only${NC}"
elif [ "$UNIT_ONLY" = true ]; then
    echo -e "${BLUE}🧩 Running UNIT tests only${NC}"
else
    echo -e "${BLUE}🎯 Running ALL tests${NC}"
fi
echo

# Run tests based on mode
if [ "$QUICK_MODE" = true ] || [ "$WORKFLOW_ONLY" = true ] || [ "$RUN_ALL" = true ]; then
    run_test_suite "Workflow Validation" \
                   "tests/workflow-test.sh" \
                   "Validates GitHub Actions workflow configuration"
fi

if [ "$UNIT_ONLY" = true ] || [ "$RUN_ALL" = true ]; then
    run_test_suite "Backend Unit Tests" \
                   "tests/unit-test.sh" \
                   "Runs Jest unit tests for backend components"
fi

if [ "$INTEGRATION_ONLY" = true ] || [ "$RUN_ALL" = true ]; then
    run_test_suite "Integration Tests" \
                   "tests/integration-test.sh" \
                   "Complete integration testing of all services"
fi

# Summary
echo
echo -e "${BLUE}📊 Test Suite Summary${NC}"
echo "======================"
echo -e "Total Suites: $TOTAL_SUITES"
echo -e "${GREEN}Passed: $PASSED_SUITES${NC}"
echo -e "${RED}Failed: $FAILED_SUITES${NC}"

if [ $FAILED_SUITES -eq 0 ]; then
    echo
    echo -e "${GREEN}🎉 All test suites passed successfully!${NC}"
    echo -e "${GREEN}✅ FLEARN is ready for deployment.${NC}"
    exit 0
else
    echo
    echo -e "${RED}❌ Some test suites failed.${NC}"
    echo -e "${YELLOW}💡 Check the logs above for details.${NC}"
    exit 1
fi
