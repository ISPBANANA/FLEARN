# FLEARN Scripts Directory

This directory contains utility scripts for managing the FLEARN application.

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
- **Node.js**: Required for some test scripts
