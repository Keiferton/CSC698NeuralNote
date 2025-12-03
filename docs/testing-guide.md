# Testing Guide

This guide explains how to test the different components of NeuralNote, including user flow tests, error boundary component tests, and request logging tests.

## Overview

- **Backend Tests**: Jest + Supertest for API integration tests
- **Frontend Tests**: React Testing Library for component tests
- **Test Database**: In-memory SQLite database (automatically used when `NODE_ENV=test`)

## Running Tests

### Backend Tests

All backend tests are located in `backend/src/__tests__/`.

#### Run All Backend Tests
```bash
cd backend
npm test
```

#### Run Only User Flow Integration Tests
```bash
cd backend
npm run test:integration
```

#### Run Specific Test File
```bash
cd backend
npm test -- integration.test.js
npm test -- requestLogging.test.js
npm test -- api.test.js
```

#### Run Tests in Watch Mode
```bash
cd backend
npm run test:watch
```

#### Run Tests with Coverage
```bash
cd backend
npm test -- --coverage
```

### Frontend Tests

All frontend tests are located in `frontend/src/` (files ending in `.test.js` or `.test.jsx`).

#### Run All Frontend Tests
```bash
cd frontend
npm test
```

#### Run Specific Test File
```bash
cd frontend
npm test -- ErrorBoundary.test.js
npm test -- App.test.js
```

#### Run Tests in Watch Mode
```bash
cd frontend
npm test
# Press 'a' to run all tests
# Press 'p' to filter by filename
# Press 't' to filter by test name
```

## Test Categories

### 1. User Flow Tests

**Location**: `backend/src/__tests__/integration.test.js`

These tests verify the complete user journey from registration to journaling:

- ✅ User creation
- ✅ Habit creation
- ✅ Journal entry creation with AI analysis
- ✅ Habit completion toggling
- ✅ Dashboard data aggregation
- ✅ Error handling
- ✅ Data consistency across operations

**Run with**:
```bash
cd backend
npm run test:integration
```

**What it tests**:
- Full end-to-end workflow
- API endpoint integration
- Data persistence
- Error cases (404, 400, etc.)
- Multi-user data isolation

### 2. Error Boundary Component Tests

**Location**: `frontend/src/components/ErrorBoundary.test.js`

These tests verify that the ErrorBoundary component properly catches and handles React errors:

- ✅ Renders children when no error occurs
- ✅ Catches and displays errors
- ✅ Logs errors to console
- ✅ Shows error details in development mode
- ✅ Hides error details in production mode
- ✅ "Try Again" button resets error state
- ✅ "Reload Page" button functionality
- ✅ Handles multiple sequential errors

**Run with**:
```bash
cd frontend
npm test -- ErrorBoundary.test.js
```

**What it tests**:
- Error catching mechanism
- Error UI rendering
- Error recovery functionality
- Environment-specific behavior

### 3. Request Logging Tests

**Location**: `backend/src/__tests__/requestLogging.test.js`

These tests verify that the request logging middleware properly logs all HTTP requests:

- ✅ Logs GET requests with method, path, status, and duration
- ✅ Logs POST requests
- ✅ Logs PUT requests
- ✅ Logs DELETE requests
- ✅ Logs error status codes (4xx, 5xx)
- ✅ Logs request duration in milliseconds
- ✅ Handles query parameters
- ✅ Logs multiple requests separately

**Run with**:
```bash
cd backend
npm test -- requestLogging.test.js
```

**What it tests**:
- Request logging middleware functionality
- Log format correctness
- Duration calculation
- Status code logging
- Multiple request handling

## Test Structure

### Backend Test Structure

```
backend/src/__tests__/
├── integration.test.js      # Full user flow tests
├── api.test.js             # Individual API endpoint tests
├── requestLogging.test.js  # Request logging middleware tests
└── aiService.test.js       # AI service tests
```

### Frontend Test Structure

```
frontend/src/
├── App.test.js                    # Main app component tests
└── components/
    └── ErrorBoundary.test.js      # Error boundary component tests
```

## Writing New Tests

### Backend Test Example

```javascript
const request = require('supertest');
const app = require('../app');

describe('My Feature', () => {
  beforeEach(() => {
    // Setup: clear database, etc.
  });

  it('should do something', async () => {
    const res = await request(app)
      .get('/api/endpoint');
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });
});
```

### Frontend Test Example

```javascript
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Backend Tests

**Issue**: Tests fail with database errors
- **Solution**: Ensure `NODE_ENV=test` is set (automatically set by npm scripts)

**Issue**: Tests interfere with each other
- **Solution**: Use `beforeEach` to clean up database state

### Frontend Tests

**Issue**: Tests fail with "Cannot find module" errors
- **Solution**: Run `npm install` in the frontend directory

**Issue**: Tests timeout
- **Solution**: Increase timeout in test file or check for async operations

## Continuous Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Backend Tests
  run: |
    cd backend
    npm test

- name: Run Frontend Tests
  run: |
    cd frontend
    npm test -- --watchAll=false
```

## Coverage Reports

Generate coverage reports:

**Backend**:
```bash
cd backend
npm test -- --coverage
```

**Frontend**:
```bash
cd frontend
npm test -- --coverage --watchAll=false
```

Coverage reports will be generated in `coverage/` directories.

