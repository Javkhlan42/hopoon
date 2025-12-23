#!/bin/bash

###############################################################################
# HopOn Platform Test Suite Runner
# Executes unit, integration, E2E, security, and performance tests
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default values
TEST_TYPE="${1:-all}"
API_URL="${API_URL:-http://localhost:3000}"
COVERAGE=false
WATCH=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --coverage)
            COVERAGE=true
            shift
            ;;
        --watch)
            WATCH=true
            shift
            ;;
        --api-url)
            API_URL="$2"
            shift 2
            ;;
        *)
            TEST_TYPE="$1"
            shift
            ;;
    esac
done

# Helper functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

print_header() {
    echo -e "\n${YELLOW}========================================${NC}"
    echo -e "${YELLOW}$1${NC}"
    echo -e "${YELLOW}========================================${NC}\n"
}

# Check if API is running
check_api() {
    print_info "Checking if API is running at $API_URL..."
    
    if curl -s -f -o /dev/null "$API_URL/health"; then
        print_success "API is running and healthy"
        return 0
    else
        print_error "API is not running at $API_URL"
        print_info "Please start the API before running integration/e2e tests"
        return 1
    fi
}

# Run unit tests
run_unit_tests() {
    print_header "Running Unit Tests"
    
    if [ "$COVERAGE" = true ]; then
        npm run test:unit -- --coverage
    elif [ "$WATCH" = true ]; then
        npm run test:watch -- --testPathPattern=test/unit
    else
        npm run test:unit
    fi
    
    if [ $? -eq 0 ]; then
        print_success "Unit tests passed"
        return 0
    else
        print_error "Unit tests failed"
        return 1
    fi
}

# Run integration tests
run_integration_tests() {
    print_header "Running Integration Tests"
    
    if ! check_api; then
        print_error "Cannot run integration tests without API"
        return 1
    fi
    
    export API_URL
    npm run test:integration
    
    if [ $? -eq 0 ]; then
        print_success "Integration tests passed"
        return 0
    else
        print_error "Integration tests failed"
        return 1
    fi
}

# Run E2E tests
run_e2e_tests() {
    print_header "Running E2E Tests"
    
    if ! check_api; then
        print_error "Cannot run E2E tests without API"
        return 1
    fi
    
    export BASE_URL="$API_URL"
    npm run test:e2e
    
    if [ $? -eq 0 ]; then
        print_success "E2E tests passed"
        return 0
    else
        print_error "E2E tests failed"
        return 1
    fi
}

# Run security tests
run_security_tests() {
    print_header "Running Security Tests"
    
    if ! check_api; then
        print_error "Cannot run security tests without API"
        return 1
    fi
    
    export API_URL
    npm run test:security
    
    if [ $? -eq 0 ]; then
        print_success "Security tests passed"
        return 0
    else
        print_error "Security tests failed"
        return 1
    fi
}

# Run performance tests
run_performance_tests() {
    print_header "Running Performance Tests"
    
    # Check if k6 is installed
    if ! command -v k6 &> /dev/null; then
        print_error "k6 is not installed. Please install k6 from https://k6.io/docs/getting-started/installation/"
        return 1
    fi
    
    if ! check_api; then
        print_error "Cannot run performance tests without API"
        return 1
    fi
    
    export BASE_URL="$API_URL"
    
    print_info "Running load test..."
    npm run test:performance:load
    
    print_info "Running stress test..."
    npm run test:performance:stress
    
    if [ $? -eq 0 ]; then
        print_success "Performance tests completed"
        return 0
    else
        print_error "Performance tests failed"
        return 1
    fi
}

# Change to test directory
cd "$(dirname "$0")/.."

# Main execution
print_header "HopOn Platform Test Suite"
print_info "Test Type: $TEST_TYPE"
print_info "API URL: $API_URL"

RESULTS=()

case $TEST_TYPE in
    unit)
        run_unit_tests
        RESULTS+=($?)
        ;;
    integration)
        run_integration_tests
        RESULTS+=($?)
        ;;
    e2e)
        run_e2e_tests
        RESULTS+=($?)
        ;;
    security)
        run_security_tests
        RESULTS+=($?)
        ;;
    performance)
        run_performance_tests
        RESULTS+=($?)
        ;;
    ci)
        run_unit_tests
        RESULTS+=($?)
        run_integration_tests
        RESULTS+=($?)
        run_e2e_tests
        RESULTS+=($?)
        run_security_tests
        RESULTS+=($?)
        ;;
    all)
        run_unit_tests
        RESULTS+=($?)
        run_integration_tests
        RESULTS+=($?)
        run_e2e_tests
        RESULTS+=($?)
        run_security_tests
        RESULTS+=($?)
        run_performance_tests
        RESULTS+=($?)
        ;;
    *)
        print_error "Invalid test type: $TEST_TYPE"
        echo "Valid types: all, unit, integration, e2e, security, performance, ci"
        exit 1
        ;;
esac

# Summary
print_header "Test Summary"

TOTAL=${#RESULTS[@]}
PASSED=$(printf "%s\n" "${RESULTS[@]}" | grep -c "^0$" || true)
FAILED=$((TOTAL - PASSED))

print_info "Total: $TOTAL | Passed: $PASSED | Failed: $FAILED"

if [ $FAILED -eq 0 ]; then
    print_success "\nAll tests passed! ✓"
    exit 0
else
    print_error "\nSome tests failed! ✗"
    exit 1
fi
