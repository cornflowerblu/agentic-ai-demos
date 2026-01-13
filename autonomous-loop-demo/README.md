# Autonomous Agent Loop Demo

This demo showcases autonomous development loops using deterministic test-driven completion. It demonstrates how AI agents can work until true completion without manual intervention between iterations.

## Overview

**Problem**: Traditional AI-assisted development requires constant human oversight—review output, run tests, fix failures, re-prompt the agent.

**Solution**: Autonomous loops where agents iterate continuously, see their previous work, learn from test failures, and automatically detect completion based on deterministic criteria.

## What This Demo Shows

1. **Deterministic Completion Criteria**: Success is defined programmatically (tests pass, not subjective judgment)
2. **Autonomous Iteration**: Agent runs repeatedly until all criteria are met
3. **Test-Driven Development**: Tests define the exact behavior expected
4. **Local (Ralph) vs. Cloud (GitHub)**: Two approaches to autonomous execution

## Project Structure

```
autonomous-loop-demo/
├── PROMPT.md                    # Agent instructions with completion criteria
├── README.md                    # This file
├── src/
│   ├── app.ts                   # Express application
│   ├── types.ts                 # TypeScript interfaces
│   └── endpoints/
│       └── products.ts          # API endpoints (skeleton → complete)
├── tests/
│   └── products.test.ts         # Test suite (19 tests defining success)
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript strict mode config
├── jest.config.js               # Test configuration
├── .ralph/
│   └── config.json              # Ralph autonomous loop config
├── .github/
│   └── workflows/
│       └── autonomous-implementation.yml  # GitHub Actions workflow
└── demo-snapshots/
    ├── iteration-0-skeleton.ts  # Starting point
    ├── iteration-3-partial.ts   # Pre-warmed demo start
    └── iteration-5-complete.ts  # Final implementation
```

## The Task

Implement a complete Products REST API with CRUD operations:
- GET /api/products - List all products
- GET /api/products/:id - Get product by ID
- POST /api/products - Create new product
- PUT /api/products/:id - Update product
- DELETE /api/products/:id - Delete product

**Initial State**: All endpoints return 501 Not Implemented
**Success Criteria**: All 19 tests pass

## How It Works

### 1. Deterministic Success Criteria

The PROMPT.md file defines what "done" means:
- ✅ All 19 tests in `tests/products.test.ts` pass
- ✅ TypeScript compiles without errors
- ✅ Completion marker output: `<promise>COMPLETE</promise>`

### 2. The Autonomous Loop (Ralph)

```bash
# Ralph runs this cycle automatically:
1. Load PROMPT.md + current code state
2. Agent attempts next iteration
3. System checks:
   - Do tests pass? (npm test)
   - Is completion marker present?
   - Are files changing (progress)?
4. If incomplete → Loop back to step 1
5. If complete → Exit gracefully
```

### 3. Exit Detection

Ralph monitors four signals:
- **Test Saturation**: Too many iterations focused only on testing (stuck)
- **Completion Signals**: Agent outputs completion marker
- **Project Health**: Tests passing, build succeeding
- **Progress**: Files are changing between iterations

### 4. Session Persistence

The agent sees its own work across iterations:
- Modified files from previous attempts
- Git history showing what changed
- Test output with specific error messages
- Build/compilation errors

## Quick Start

### Prerequisites

- Node.js 24.x or higher
- npm

### Installation

```bash
cd autonomous-loop-demo
npm install
```

### Run Tests (See Initial State)

```bash
npm test
```

You should see 19 failing tests—all endpoints return 501 Not Implemented.

### Demo Flow (Pre-Warmed)

For presentation efficiency, we use a pre-warmed approach:

#### 1. Show Initial State
```bash
cat PROMPT.md                    # Show completion criteria
cat tests/products.test.ts | grep "it("  # Show test cases
npm test                         # Show failing tests (19 failures)
```

#### 2. Load Pre-Warmed State
```bash
# Copy partial implementation (GET/POST done, PUT/DELETE pending)
cp demo-snapshots/iteration-3-partial.ts src/endpoints/products.ts
npm test                         # Now ~12 tests pass, 7 fail
```

#### 3. Run Autonomous Loop
```bash
npm run ralph  # Would start autonomous agent
# Agent sees:
#   - PROMPT.md objectives
#   - 7 failing tests (PUT/DELETE endpoints)
#   - Partial implementation
# Agent iterates:
#   - Implements PUT endpoint
#   - Runs tests, sees progress
#   - Implements DELETE endpoint
#   - Verifies all tests pass
#   - Outputs <promise>COMPLETE</promise>
```

#### 4. Verify Completion
```bash
npm test       # All 19 tests passing ✅
git log        # See commits from autonomous iterations
cat src/endpoints/products.ts  # See complete implementation
```

### Full Run (From Scratch)

To see the complete autonomous loop:

```bash
# Reset to skeleton
cp demo-snapshots/iteration-0-skeleton.ts src/endpoints/products.ts

# Run autonomous loop (requires ralph plugin)
npm run ralph

# Watch as agent iterates through ~5-7 cycles:
# - Iteration 1: Implements GET endpoints
# - Iteration 2: Implements POST endpoint with validation
# - Iteration 3: Fixes validation edge cases
# - Iteration 4: Implements PUT endpoint
# - Iteration 5: Implements DELETE endpoint
# - Iteration 6: Final verification, outputs COMPLETE marker
```

## GitHub Integration

The same autonomous loop can run in GitHub Actions:

```bash
# Push to trigger
git push origin feature/add-products-endpoint

# GitHub Actions will:
# 1. Check out code
# 2. Install dependencies
# 3. Run autonomous agent loop
# 4. Verify all tests pass
# 5. Post results to PR
```

See `.github/workflows/autonomous-implementation.yml` for the workflow configuration.

## Key Differences: Local vs. Cloud

| Aspect | Ralph (Local) | GitHub Actions (Cloud) |
|--------|---------------|------------------------|
| **Control** | Full customization | Standardized workflow |
| **Execution** | Your machine | GitHub runners |
| **Cost** | Your API quota | GitHub Actions minutes + API |
| **Setup** | Ralph plugin install | Just push code |
| **Visibility** | Terminal output | Actions UI, PR comments |
| **Best For** | Development, experimentation | CI/CD, team collaboration |

## Ralph Configuration

See `.ralph/config.json`:

```json
{
  "maxIterations": 50,
  "sessionTimeout": "24h",
  "completionMarker": "<promise>COMPLETE</promise>",
  "testCommand": "npm test",
  "circuitBreaker": {
    "maxConsecutiveTestOnlyLoops": 3
  }
}
```

## Test Suite Details

19 tests covering:
- ✅ 2 tests for GET /api/products
- ✅ 2 tests for GET /api/products/:id
- ✅ 5 tests for POST /api/products (including validation)
- ✅ 3 tests for PUT /api/products/:id
- ✅ 2 tests for DELETE /api/products/:id
- ✅ 1 test for data persistence

All tests use supertest for HTTP assertions.

## When to Use Autonomous Loops

### ✅ Good Use Cases
- **Mechanical tasks** with clear success criteria
- **Test-driven development** where tests define behavior
- **CRUD implementations** from specifications
- **Bug fixes** with regression tests
- **Code generation** from templates
- **Test coverage** improvements

### ❌ Not Ideal For
- **Novel algorithm design** (requires human judgment)
- **Architectural decisions** (needs domain expertise)
- **Security-critical code** (needs expert review)
- **Subjective improvements** (no deterministic verification)

## Learning Outcomes

After this demo, you'll understand:
1. How to write effective completion criteria
2. The power of deterministic verification
3. How test suites can drive autonomous development
4. Ralph's exit detection mechanisms
5. When autonomous loops are appropriate
6. Local vs. cloud autonomous execution trade-offs

## Key Takeaway

**Autonomous loops work because they exploit this insight**:
AI agents are excellent at mechanical iteration but poor at knowing when to stop. By making "done" deterministic (tests pass, not "looks good") and feeding failures back without filtering, we create a self-correcting system that persists until true completion.

## Demo Tips

1. **Pre-warm for live demos**: Start at iteration 3 to show final 2-3 iterations
2. **Have backup recording**: Network/API issues can happen
3. **Show the PROMPT.md**: It's the key to deterministic completion
4. **Emphasize test suite**: Tests define objective success
5. **Compare local vs. cloud**: Highlight trade-offs

## Resources

- [Ralph Plugin Documentation](https://github.com/frankbria/ralph-claude-code)
- [Claude Code Documentation](https://code.claude.com)
- [Test-Driven Development Principles](https://en.wikipedia.org/wiki/Test-driven_development)

## License

MIT
