# AI-Assisted Software Development - Demo Plan

## Overview
Demos for a presentation on AI-assisted software development using Claude Code (terminal) and GitHub Copilot (VS Code).

## Tools & Integrations
- **Claude Code** - Terminal app
- **GitHub Copilot** - VS Code extension
- **GitHub Spec Kit** - Spec-driven development
- **MCP Servers:** Context7, Microsoft Docs, AWS Documentation, Jira

---

## Demo 1: The AI-Enabled Builder Workflow

### 1A: Researching with Agents
**Scenario:** Explore an unfamiliar open-source project to understand its architecture

```
"I've just cloned the FastAPI repository. Help me understand
the request lifecycle - how does a request flow from the router
to the response?"
```

**What it shows:**
- Parallel agent exploration of codebase
- Agents reading multiple files simultaneously
- Synthesizing architectural understanding
- Using Context7 MCP to pull FastAPI documentation inline

---

### 1B: Planning with Agents
**Scenario:** Plan a new feature using plan mode

```
"I want to add rate limiting to our API. Enter plan mode and
design an implementation approach."
```

**What it shows:**
- Entering plan mode for non-trivial tasks
- Agent exploring existing middleware patterns
- Presenting multiple approaches (Redis vs in-memory)
- User approval before implementation begins

---

### 1C: Building with Agents
**Scenario:** Implement the planned feature with parallel agents

```
"Implement the rate limiting feature. Use parallel agents to
create the middleware, update the config, and add the Redis
client simultaneously."
```

**What it shows:**
- Multiple agents working in parallel
- One agent on middleware, one on config, one on Redis client
- Todo list tracking progress across agents
- Code appearing in VS Code via Copilot for review

---

### 1D: Testing with Agents
**Scenario:** Generate and run tests for the new feature

```
"Write comprehensive tests for the rate limiting middleware,
then run them and fix any failures."
```

**What it shows:**
- Test generation based on implementation
- Running test suite in background
- Automatic iteration on failures
- Final passing test suite

---

## Demo 2: Spec-Driven Development with GitHub Spec Kit

**Scenario:** Build a feature from a GitHub issue using spec kit

**Step 1:** Create a detailed spec from a Jira ticket
```
"Pull PROJ-1234 from Jira and create a GitHub spec for the
user notification preferences feature."
```

**Step 2:** Generate implementation plan from spec
```
/spec-plan
```

**Step 3:** Implement with spec guidance
```
"Implement the notification preferences feature according to
the spec. Reference Microsoft Docs for the email service
integration patterns."
```

**What it shows:**
- Jira MCP integration pulling requirements
- Spec kit creating structured specifications
- Implementation guided by spec (not hallucinated)
- Microsoft Docs MCP for API patterns
- PR created with spec linkage

---

## Demo 3: MCP Server Integrations

**Scenario:** Build a feature requiring multiple documentation sources

```
"I need to create a Lambda function that uses DynamoDB streams
to trigger notifications. Help me understand the event structure
and implementation patterns."
```

**What it shows:**
- AWS Documentation MCP for Lambda/DynamoDB patterns
- Context7 for any SDK-specific docs
- Agents synthesizing multiple sources
- Code generation with accurate API usage

---

## Demo 4: Parallel GitHub Workflows

**Scenario:** Show parallel agent workflows on GitHub Actions

```yaml
# .github/workflows/parallel-review.yml
# Trigger multiple specialized agents on PR
- security-review-agent
- performance-review-agent
- documentation-review-agent
```

**What it shows:**
- Multiple agents triggered by PR
- Each agent has different skills/tools
- Results aggregated into PR comments
- Parallel execution in GitHub Actions

---

## Demo 5: Skills & Rules

### 5A: Skills in Action
**Scenario:** Show skill invocation and modularity

```
/commit           # Skill for structured commits
/review-pr 123    # Skill for PR review
/security-scan    # Custom skill
```

**What it shows:**
- Built-in vs custom skills
- Skills as reusable workflows
- Skill output formatting

---

### 5B: Rules Enforcement
**Scenario:** Show how rules guide agent behavior

```markdown
# .claude/rules.md
- Always use TypeScript strict mode
- All API endpoints must have OpenAPI annotations
- Never commit directly to main
- Use conventional commits format
```

**What it shows:**
- Project-specific rules
- Agent respecting rules during generation
- Rules preventing mistakes before they happen

---

## Demo 6: Parallel Agent Workflows (Terminal)

**Scenario:** Refactor a module with parallel exploration and implementation

```
"Refactor the payment processing module. In parallel:
1. Have one agent analyze the current implementation
2. Have another agent research best practices from AWS docs
3. Have a third agent check our Jira for related tickets"
```

**What it shows:**
- Three agents launched simultaneously
- Different MCP servers per agent (AWS, Jira)
- Results synthesized into action plan
- Terminal showing parallel progress

---

## Demo 7: Autonomous Agent Loops with Deterministic Completion

**Scenario:** Implement Products API endpoints autonomously using ralph

**Demo Flow:**

### Part 1: Setup & Context (1 min)
```bash
cd autonomous-loop-demo
cat PROMPT.md  # Show completion criteria
npm test       # Show current state: some tests passing, some failing
```

### Part 2: Pre-Warm Explanation (30 sec)
"I've already run this through 3 iterations. The agent has implemented GET and POST endpoints. Now let's watch it complete the remaining PUT and DELETE endpoints autonomously."

```bash
git log --oneline  # Show iteration history
cat src/endpoints/products.ts  # Show partial implementation
```

### Part 3: Launch Ralph for Final Iterations (2 min)
```bash
/ralph-loop:ralph-loop PROMPT.md --completion-promise COMPLETE --max-iterations 30
# Watch as agent:
#   - Sees failing PUT/DELETE tests
#   - Implements PUT endpoint
#   - Re-runs tests, sees progress
#   - Implements DELETE endpoint
#   - Verifies all tests pass
#   - Outputs <promise>COMPLETE</promise>
#   - Ralph detects completion and exits
```

### Part 4: Verify Completion (30 sec)
```bash
npm test       # All 19 tests passing ✅
git log        # Show 2 new commits from autonomous iterations
cat src/endpoints/products.ts  # Show complete implementation
```

### Part 5: GitHub Integration (2 min)
"Now let me show you how this same autonomous loop works in GitHub. They have built-in autonomous agents, so to get started quickly, you can use their cloud-based approach. But for customization and local control, ralph gives you more flexibility."

```bash
cat .github/workflows/autonomous-implementation.yml  # Show the workflow
# Demo GitHub Actions UI (optional)
```

**What it shows:**
- PROMPT.md with clear completion criteria and `<promise>COMPLETE</promise>` marker
- Deterministic success verification (tests pass, not subjective judgment)
- Test-driven autonomous development (tests define behavior)
- Autonomous iteration until objective criteria met
- Exit detection and completion verification
- Session persistence (agent sees its own work across iterations)
- Local (ralph) vs. cloud (GitHub) autonomous execution
- When to use autonomous loops vs. manual iteration

**Key Insight:** Don't trust the agent's claim that it's done—verify programmatically using deterministic tests.

---

## Demo 8: Autonomous IaC with AWS CDK

**Scenario:** Implement serverless API infrastructure autonomously using AWS CDK

**Demo Flow:** (8-10 min total, pre-warmed)

### Part 1: Setup & Context (2 min)
```bash
cd autonomous-loop-demo-iac
cat PROMPT.md                      # Show multi-phase criteria
npm run preflight                  # Validate AWS credentials
npm run test:unit                  # Show 12/12 unit tests passing
```

### Part 2: Show Initial State (1 min)
```bash
npm run demo:reset                 # Load skeleton Lambda
npm run deploy                     # Deploy infrastructure (~2-3 min)
npm run test:integration           # All 19 tests fail (Lambda not implemented)
```

### Part 3: Load Pre-Warmed State (30 sec)
```bash
npm run demo:prewarm               # GET/POST implemented
npm run deploy                     # Re-deploy with partial implementation
npm run test:integration           # 12/19 passing, 7 failing
```

### Part 4: Autonomous Loop (3 min)
```bash
/ralph-loop:ralph-loop PROMPT.md --completion-promise COMPLETE --max-iterations 30
# Watch as agent:
#   - Implements PUT endpoint for updating products
#   - Re-runs integration tests, sees progress
#   - Implements DELETE endpoint
#   - Verifies all tests pass
#   - Outputs <promise>COMPLETE</promise>
```

### Part 5: Verify & Cleanup (2 min)
```bash
npm run test:integration           # 19/19 passing ✅
npm run destroy                    # Cleanup AWS resources
```

**What it shows:**
- Multi-phase testing (unit tests → CDK synth → deployment → integration tests → cleanup)
- Deterministic IaC completion criteria
- Integration tests against **live AWS resources** (DynamoDB, Lambda, API Gateway)
- Autonomous iteration with infrastructure deployment
- Cost-conscious cleanup mechanisms (< $0.50 per run)
- Same test-driven pattern applied to infrastructure, not just application code

**Key Takeaway:** Autonomous agents can manage infrastructure deployment end-to-end, with objective success criteria based on live resource validation.

---

## Suggested Demo Flow

| Order | Demo | Duration | Key Tool/Feature |
|-------|------|----------|------------------|
| 1 | Research (1A) | 3 min | Explore agent, Context7 |
| 2 | Plan (1B) | 3 min | Plan mode |
| 3 | Spec-Driven (2) | 5 min | Spec Kit, Jira MCP |
| 4 | Build (1C) | 4 min | Parallel agents |
| 5 | MCP Servers (3) | 3 min | AWS/MS Docs MCPs |
| 6 | Test (1D) | 3 min | Test generation |
| 7 | Autonomous Loops (7) | 6 min | Ralph, deterministic tests, GitHub |
| 8 | Autonomous IaC (8) | 8-10 min | AWS CDK, multi-phase testing |
| 9 | GitHub Parallel (4) | 3 min | GitHub Actions |
| 10 | Skills & Rules (5) | 3 min | Skills, rules enforcement |

**Total estimated time:** ~41-43 minutes

---

## Notes
- Custom agents will be demoed using pre-existing configurations (available to builders after session)
- Parallel agent workflows shown both in terminal and on GitHub
