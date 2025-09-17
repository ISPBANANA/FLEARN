# FLEARN Scripts Directory

This directory contains utility scripts for managing the FLEARN application.

## 🚀 Quick Start

### For Auth0 Testing:
```bash
# Start the complete test environment
./scripts/start-auth0-test.sh

# Run Auth0 tests
node ./scripts/test-auth0.js

# When done, stop the environment
./scripts/stop-auth0-test.sh
```

### For General Testing:
```bash
# Run all tests
./scripts/run-tests.sh
```

## Available Scripts

### 🎣 Deployment Scripts

- **`setup-webhook.sh`** - Configure GitHub webhooks for automatic deployment
  ```bash
  ./scripts/setup-webhook.sh
  # or with custom secret:
  ./scripts/setup-webhook.sh your_custom_secret
  ```

- **`update.sh`** - Manual deployment/update script
  ```bash
  ./scripts/update.sh
  ```

- **`test-webhook.sh`** - Test webhook system functionality
  ```bash
  ./scripts/test-webhook.sh
  ```

### 🧪 Testing Scripts

- **`run-tests.sh`** - Main test runner for all test types
  ```bash
  ./scripts/run-tests.sh                  # Run all tests
  ./scripts/run-tests.sh --quick          # Quick validation
  ./scripts/run-tests.sh --integration    # Integration tests
  ./scripts/run-tests.sh --workflow       # Workflow tests
  ./scripts/run-tests.sh --unit           # Unit tests
  ./scripts/run-tests.sh --help           # Show help
  ```

### 🔐 Auth0 Testing Scripts

- **`start-auth0-test.sh`** - Start complete Auth0 test environment
  ```bash
  ./scripts/start-auth0-test.sh
  ```
  Starts databases, backend server, and prepares all Auth0 testing components.

- **`stop-auth0-test.sh`** - Stop Auth0 test environment
  ```bash
  ./scripts/stop-auth0-test.sh
  ```
  Cleanly stops all Auth0 test environment components and frees resources.

- **`test-auth0.js`** - Comprehensive Auth0 integration test
  ```bash
  node ./scripts/test-auth0.js
  ```
  Tests Auth0 domain accessibility, JWT validation, and API endpoints.

- **`test-auth0-token.js`** - Auth0 token generation and validation test
  ```bash
  node ./scripts/test-auth0-token.js
  ```
  Tests machine-to-machine token generation and API authentication.

- **`auth0-test.html`** - Interactive Auth0 testing interface
  ```bash
  # Serve the HTML file with a local server
  python3 -m http.server 8080 --directory scripts/
  # Then open http://localhost:8080/auth0-test.html
  ```
  Browser-based Auth0 login testing with live API calls.

## Script Organization

All scripts are executable and should be run from the project root directory:

```bash
# From /home/yotshiba/ispbanana/FLEARN/
./scripts/script-name.sh
```

## Dependencies

- **Docker & Docker Compose**: Required for all deployment scripts
- **Git**: Required for update and webhook scripts
- **curl**: Required for testing scripts
- **Node.js**: Required for Auth0 test scripts and some other test scripts
- **Python3**: Optional, for serving HTML test files locally
