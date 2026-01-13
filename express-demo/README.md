# Express TypeScript Demo

A demonstration project for AI-assisted development workflows with TypeScript strict mode.

## Overview

This is a minimal Express application showcasing:
- TypeScript with strict mode enabled
- Express 5.x REST API structure with CRUD operations
- Rate limiting middleware placeholders
- Configuration management with environment variables
- Test setup with Jest and Supertest

**Note:** This is a demo project intended for demonstrating AI capabilities in code assistance, refactoring, and feature implementation. It is not intended for production use.

## Project Structure

```
express-demo/
├── src/
│   ├── index.ts           # Main application with API endpoints
│   ├── config/
│   │   └── index.ts       # Application configuration
│   ├── middleware/        # Middleware directory (rate limiting to be added)
│   └── routes/
│       └── users.ts       # User routes
├── tests/
│   └── users.test.ts      # API tests
├── package.json           # Node.js dependencies
├── tsconfig.json          # TypeScript strict configuration
└── jest.config.js         # Jest test configuration
```

## Requirements

- Node.js 24.x LTS "Krypton" or higher (latest stable as of January 2026)
- npm or yarn

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

3. Run in development mode:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   npm start
   ```

5. Access the API:
   - API: http://localhost:3000
   - Health check: http://localhost:3000/health

## Running Tests

```bash
npm test
```

Watch mode:
```bash
npm run test:watch
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| GET | `/health` | Health check |
| GET | `/users` | List all users |
| GET | `/users/:id` | Get user by ID |
| POST | `/users` | Create new user |
| PUT | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |

## TypeScript Configuration

This project uses TypeScript strict mode with all type safety checks enabled. See `tsconfig.json` for the complete configuration.

## Future Enhancements

This project includes TODO comments marking where additional features would be integrated:
- Rate limiting middleware
- Database integration (TypeORM or Prisma)
- Authentication/Authorization (JWT)
- Logging and monitoring
- OpenAPI/Swagger documentation

## Purpose

This demo project serves as a foundation for demonstrating AI-assisted development capabilities including:
- TypeScript strict mode enforcement
- Code generation with proper typing
- Refactoring suggestions
- Feature implementation following best practices
- Test writing with type safety
- Rules-based development
