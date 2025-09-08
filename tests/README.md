# FLEARN Tests Directory

This directory contains all test scripts and configurations for the FLEARN project.

## 📁 Directory Structure

```
tests/
├── README.md              # This file
├── integration-test.sh    # Full integration testing
├── workflow-test.sh       # GitHub Actions workflow validation
└── unit-test.sh          # Unit tests for backend and frontend
```

## 🧪 Test Scripts

### `integration-test.sh`
**Purpose**: Complete integration testing of the entire FLEARN stack
- Tests Docker container orchestration
- Validates service health and connectivity
- Checks API endpoints and database connections
- Monitors resource usage and performance
- **Runtime**: ~3-5 minutes

**Usage**:
```bash
./tests/integration-test.sh
```

### `workflow-test.sh`
**Purpose**: Validates GitHub Actions workflow configuration
- Checks YAML syntax and structure
- Verifies required jobs and steps
- Validates Docker configurations
- Tests workflow triggers and conditions
- **Runtime**: ~10-30 seconds

**Usage**:
```bash
./tests/workflow-test.sh
```

### `unit-test.sh`
**Purpose**: Runs unit tests for individual components
- Backend Jest tests
- Frontend linting and build tests
- Configuration validation
- Package.json verification
- **Runtime**: ~1-2 minutes

**Usage**:
```bash
./tests/unit-test.sh
./tests/unit-test.sh --coverage  # With coverage report
```

## 🚀 Quick Start

### Run All Tests
```bash
./run-tests.sh
```

### Run Specific Test Types
```bash
./run-tests.sh --quick        # Workflow validation only
./run-tests.sh --integration  # Integration tests only
./run-tests.sh --workflow     # Workflow tests only
./run-tests.sh --unit         # Unit tests only
```

### Manual Test Execution
```bash
# Individual test scripts
./tests/workflow-test.sh
./tests/unit-test.sh
./tests/integration-test.sh

# With specific options
./tests/unit-test.sh --coverage
```

## 📋 Test Categories

### ✅ **Quick Tests** (~30 seconds)
- Workflow configuration validation
- Package.json syntax checks
- Docker file existence
- Basic configuration validation

### ✅ **Unit Tests** (~1-2 minutes)
- Backend Jest tests
- Frontend linting (ESLint)
- Build process validation
- Configuration file validation

### ✅ **Integration Tests** (~3-5 minutes)
- Docker compose orchestration
- Service health checks
- Database connectivity
- API endpoint validation
- End-to-end workflow testing

## 🔧 Requirements

### System Requirements
- **Docker**: For integration tests
- **Node.js 18+**: For unit tests
- **curl**: For API testing
- **jq**: For JSON validation

### Optional Tools
- **yq**: For YAML validation
- **mongosh**: For MongoDB testing
- **psql**: For PostgreSQL testing

## 📊 Test Results

### Success Indicators
- ✅ All containers start successfully
- ✅ Health endpoints return HTTP 200
- ✅ Database connections established
- ✅ API endpoints respond correctly
- ✅ Frontend builds without errors
- ✅ All tests pass with 0 failures

### Common Failure Patterns
- ❌ Port conflicts (solution: `docker compose down -v`)
- ❌ Missing dependencies (solution: `npm ci`)
- ❌ Build cache issues (solution: `docker system prune -f`)
- ❌ Service startup timeout (solution: increase wait times)

## 🛠️ Troubleshooting

### Debug Individual Services
```bash
# Check service logs
docker compose logs flearn-backend
docker compose logs flearn-frontend
docker compose logs postgres
docker compose logs mongodb

# Check service status
docker compose ps
docker compose top
```

### Clean Environment
```bash
# Stop all services
docker compose down -v

# Clean Docker system
docker system prune -f

# Remove all volumes
docker volume prune -f
```

### Test Environment Issues
```bash
# Reset test environment
./tests/integration-test.sh  # Includes cleanup

# Manual cleanup
docker compose down -v
docker system prune -f
```

## 📝 Adding New Tests

### Backend Unit Tests
Add new test files to `FLEARN-back/tests/`:
```javascript
// FLEARN-back/tests/new-feature.test.js
describe('New Feature', () => {
  test('should work correctly', () => {
    expect(true).toBe(true);
  });
});
```

### Frontend Tests
Add tests to frontend package.json:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

### Integration Tests
Modify `integration-test.sh` to add new service tests:
```bash
# Add new test
run_test "New Service Test" "curl -f http://localhost:PORT/endpoint"
```

## 🔄 CI/CD Integration

These tests are automatically run by GitHub Actions on:
- Push to main branch
- Pull request creation
- Manual workflow dispatch

The CI/CD pipeline uses the same test scripts for consistency between local and remote testing.

## 📚 Related Documentation

- [Main Testing Guide](../TESTING.md)
- [Docker Setup](../docker-compose.yml)
- [GitHub Actions Workflow](../.github/workflows/docker-compose-ci.yml)
- [Backend Package](../FLEARN-back/package.json)
- [Frontend Package](../FLEARN-front/package.json)
