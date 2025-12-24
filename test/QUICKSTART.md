# Testing Guide - Quick Start

## Installation

```bash
cd test
npm install
```

## Running Tests

### All Tests

```bash
# Windows
.\scripts\run-tests.ps1 all

# Linux/Mac
./scripts/run-tests.sh all
```

### Specific Tests

```bash
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests (requires API)
npm run test:e2e          # E2E tests (requires Frontend & API)
npm run test:security     # Security tests (requires API)
npm run test:performance  # Performance tests (requires k6 & API)
```

## Prerequisites

### For Integration/E2E/Security Tests

- ✅ API must be running: `nx serve api-gateway`
- ✅ Database must be connected
- ✅ Frontend must be running (E2E only): `nx serve hop-on`

### For Performance Tests

- ✅ Install k6:
  - Windows: `choco install k6`
  - Linux: `sudo apt install k6`
  - Mac: `brew install k6`

## Quick Commands

```bash
# Watch mode (development)
npm run test:watch

# Coverage report
npm run test:coverage

# CI mode
npm run test:ci

# E2E with UI (interactive)
npm run test:e2e:ui
```

## Environment Setup

```bash
# Set API URL
export API_URL=http://localhost:3000
export BASE_URL=http://localhost:3001

# Or create .env file
echo "API_URL=http://localhost:3000" > .env
echo "BASE_URL=http://localhost:3001" >> .env
```

## Test Coverage

- ✅ **Unit Tests:** 3 services (auth, ride, booking)
- ✅ **Integration Tests:** 3 API flows (auth, ride, booking)
- ✅ **E2E Tests:** Complete user journey
- ✅ **Security Tests:** 10+ security checks
- ✅ **Performance Tests:** 4 load scenarios

## Need Help?

See full documentation: [test/README.md](./README.md)
