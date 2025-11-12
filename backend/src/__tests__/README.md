# Messaging Tests

This directory contains tests for the messaging functionality, specifically testing employee-to-admin messaging via Socket.IO.

## Setup

Before running the tests, make sure to install the required dependencies:

```bash
npm install
```

This will install:
- `jest` - Testing framework
- `ts-jest` - TypeScript support for Jest
- `@types/jest` - TypeScript type definitions for Jest
- `socket.io-client` - Socket.IO client for testing

## Running Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Test Coverage

The test file `message.socket.test.ts` covers:

1. **Employee sending message to admin**
   - Verifies message is sent via Socket.IO
   - Verifies message is saved to database
   - Verifies message structure and content
   - Verifies sender and receiver information

2. **Admin replying to employee message**
   - Verifies admin can receive employee's message
   - Verifies admin can reply to employee
   - Verifies conversation history is maintained
   - Verifies both messages are saved correctly

3. **Security and validation**
   - Verifies users cannot message users from different companies
   - Verifies required fields validation
   - Verifies error handling

4. **Unread count**
   - Verifies unread message count is tracked correctly

## Test Database

The tests use a test database. Make sure you have:
- A PostgreSQL database available
- The `DATABASE_URL` environment variable set (or it will use the default)

The tests will:
- Create test data (company, admin user, employee user)
- Clean up test data after tests complete

## Notes

- Tests use a separate port (dynamically assigned) to avoid conflicts
- Socket.IO connections are properly cleaned up after each test
- Test data is isolated and cleaned up automatically

