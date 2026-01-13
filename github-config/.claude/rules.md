# Project Rules and Standards

This document defines the coding standards, conventions, and requirements that must be followed in this project. Claude Code agents will enforce these rules during code review.

## AI Agent Guidelines

### Information Verification

Do not assume you have the latest information, because your training date is in the past. Always double check with your available skills, MCP servers, or the internet if possible, before making assumptions about versions, frameworks, libraries, or tools.

### Troubleshooting Escalation

If you find yourself going in circles during troubleshooting, work with the user to determine if the requirements can be adjusted or simplified to make the problem easier to solve. You can define "going in circles" as repeating the same steps or suggestions without making progress toward a solution.

## TypeScript Configuration

### Strict Mode Required

All TypeScript code must compile with strict mode enabled. The following tsconfig settings are mandatory:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Type Safety Rules

- **No `any` type**: Use `unknown` for truly unknown types, or define proper interfaces
- **No type assertions** (`as`): Prefer type guards or proper typing
- **No non-null assertions** (`!`): Handle null/undefined explicitly
- **Explicit return types**: All exported functions must have explicit return type annotations

## API Documentation

### OpenAPI Annotations Required

All HTTP endpoints must have OpenAPI annotations. Use the following structure:

```typescript
/**
 * @openapi
 * /api/v1/resource:
 *   post:
 *     summary: Create a new resource
 *     description: Detailed description of the endpoint
 *     tags:
 *       - Resources
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateResourceRequest'
 *     responses:
 *       201:
 *         description: Resource created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
```

### Required Documentation Elements

- Summary (one line)
- Description (detailed explanation)
- Request body schema (if applicable)
- All possible response codes with schemas
- Authentication requirements
- Rate limiting information

## Git Workflow

### Conventional Commits

All commits must follow the Conventional Commits specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Allowed Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only changes |
| `style` | Code style changes (formatting, semicolons, etc.) |
| `refactor` | Code refactoring (no feature change, no bug fix) |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `build` | Build system or external dependencies |
| `ci` | CI/CD configuration changes |
| `chore` | Other changes that don't modify src or test files |
| `revert` | Reverts a previous commit |

#### Examples

```
feat(payments): add support for recurring billing
fix(auth): resolve token refresh race condition
docs(api): update OpenAPI spec for user endpoints
refactor(utils): simplify date parsing logic
```

### Branch Protection

#### No Direct Commits to Main

- All changes must go through pull requests
- PRs require at least 1 approval
- All status checks must pass before merge
- Force pushes to main are prohibited

#### Branch Naming Convention

```
<type>/<ticket-number>-<short-description>
```

Examples:
- `feat/PROJ-123-add-payment-retry`
- `fix/PROJ-456-auth-token-refresh`
- `docs/PROJ-789-api-documentation`

## Testing Requirements

### Test Coverage

- **Minimum 80% code coverage** for all new code
- **100% coverage** for critical paths (payments, authentication, authorization)
- Coverage reports must be generated on each PR

### Test Types Required

1. **Unit Tests**: All business logic must have unit tests
2. **Integration Tests**: All API endpoints must have integration tests
3. **E2E Tests**: Critical user flows must have E2E tests

### Test Naming Convention

```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should [expected behavior] when [condition]', () => {
      // test implementation
    });
  });
});
```

## Security Requirements

### Mandatory Security Scanning

1. **Dependency Scanning**: Run on every PR
   - No critical vulnerabilities allowed
   - High vulnerabilities require justification

2. **SAST (Static Analysis)**: Required for all code changes
   - Security hotspots must be reviewed
   - No new security issues in critical categories

3. **Secret Scanning**: Automated on all commits
   - No secrets, API keys, or credentials in code
   - Use environment variables or secret management

### Security Coding Standards

- **Input Validation**: All user inputs must be validated
- **Output Encoding**: All outputs must be properly encoded
- **Authentication**: Use established auth libraries only
- **Authorization**: Implement role-based access control
- **Encryption**: Use TLS 1.3 for transit, AES-256 for rest
- **Logging**: Never log sensitive data (PII, credentials, tokens)

## Code Quality Standards

### Linting

ESLint must pass with zero errors:

```bash
npm run lint
```

### Formatting

Prettier must be applied to all code:

```bash
npm run format:check
```

### Complexity Limits

- **Cyclomatic complexity**: Maximum 10 per function
- **Cognitive complexity**: Maximum 15 per function
- **File length**: Maximum 300 lines
- **Function length**: Maximum 50 lines

## Error Handling

### Error Response Format

All API errors must follow this format:

```typescript
interface ErrorResponse {
  error: {
    code: string;           // Machine-readable error code
    message: string;        // Human-readable message
    details?: unknown;      // Additional context
    requestId: string;      // For tracing
    timestamp: string;      // ISO 8601 format
  };
}
```

### Error Codes

Use standardized error codes:

- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_ERROR`: Authentication required or failed
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource state conflict
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Unexpected server error

## Performance Requirements

### Response Time SLAs

- **P50**: < 100ms
- **P95**: < 500ms
- **P99**: < 1000ms

### Database Queries

- No N+1 queries
- All queries must use indexes
- Maximum 5 queries per API call
- Use connection pooling

### Caching

- Cache frequently accessed data
- Set appropriate TTLs
- Implement cache invalidation

## Review Checklist

Before submitting a PR, ensure:

- [ ] TypeScript strict mode passes
- [ ] All endpoints have OpenAPI annotations
- [ ] Commit messages follow conventional commits
- [ ] Test coverage meets requirements
- [ ] Security scans pass
- [ ] Linting passes
- [ ] Documentation is updated
- [ ] No secrets in code
- [ ] Error handling follows standards
