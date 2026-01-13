# AI-Assisted Software Development Demos

A collection of hands-on demonstrations showcasing modern AI-assisted development workflows using Claude Code, GitHub Copilot, and Model Context Protocol (MCP) integrations.

## Overview

These demos illustrate real-world patterns for AI-assisted software development, from exploration and planning to autonomous implementation and CI/CD automation.

## Featured Demos

### 🤖 Autonomous Agent Loops

**[Demo 7: Autonomous Loop (Local)](./autonomous-loop-demo/)**
- Test-driven autonomous development with deterministic completion
- Agent implements Products REST API until all tests pass
- Uses ralph-loop plugin for local autonomous iteration
- **Command**: `/ralph-loop:ralph-loop PROMPT.md --completion-promise COMPLETE --max-iterations 30`

**[Demo 8: Autonomous IaC with AWS CDK](./autonomous-loop-demo-iac/)**
- Serverless infrastructure implementation with multi-phase testing
- Deploys DynamoDB, Lambda, and API Gateway autonomously
- GitHub Actions CI/CD with commit message triggers (`[deploy-to-aws]`)
- Full deployment cycle: unit tests → deploy → integration tests → cleanup
- **Battle-tested**: Self-debugged through 7 iterations in production

### 📚 AI-Enabled Research & Planning

**Demo 1: The AI-Enabled Builder Workflow**
- Codebase exploration with parallel agents
- Plan mode for feature design
- Parallel implementation across multiple files
- Automated testing and iteration

**Demo 2: Spec-Driven Development**
- GitHub Spec Kit integration
- Jira ticket → GitHub spec workflow
- MCP-powered documentation lookup (Microsoft Docs, AWS, Context7)

### 🔌 MCP Server Integrations

**Demo 6: Model Context Protocol (MCP)**
- Context7 for library documentation
- Microsoft Learn for Azure/Microsoft docs
- AWS Knowledge Base for AWS documentation
- Real-time documentation in your development flow

## Quick Start

### Prerequisites

- [Claude Code](https://claude.com/claude-code) CLI
- Node.js 24.x or higher
- AWS CLI (for Demo 8)
- GitHub CLI `gh` (optional, for workflows)

### Installation

```bash
# Clone the repository
git clone https://github.com/cornflowerblu/agentic-ai-demos.git
cd agentic-ai-demos

# Choose a demo
cd autonomous-loop-demo        # Local autonomous loop
# OR
cd autonomous-loop-demo-iac    # AWS CDK autonomous loop

# Install dependencies
npm install

# Run the demo (see individual README for details)
/ralph-loop:ralph-loop PROMPT.md --completion-promise COMPLETE --max-iterations 30
```

## Demo Structure

Each demo includes:
- **README.md** - Detailed setup and usage instructions
- **PROMPT.md** - Agent instructions with completion criteria
- **Demo snapshots** - Pre-warmed states for efficient presentations
- **Test suites** - Deterministic success verification
- **Source code** - Working implementations

## Key Concepts

### Autonomous Loops
Agents iterate continuously until objective criteria are met (tests pass, build succeeds). No manual intervention between iterations.

### Deterministic Completion
Success is verified programmatically, not subjectively:
- ✅ All tests pass
- ✅ TypeScript compiles
- ✅ Specific markers present (`<promise>COMPLETE</promise>`)

### Multi-Phase Testing (Demo 8)
1. **Unit tests** - Validate infrastructure configuration
2. **Deployment** - Deploy to AWS
3. **Integration tests** - Test against live resources
4. **Cleanup** - Guaranteed resource cleanup

### MCP (Model Context Protocol)
Connect AI agents to external data sources:
- Library documentation (Context7)
- Cloud provider docs (AWS, Azure)
- Issue tracking (Jira)
- Real-time, context-aware assistance

## Documentation

- **[Demo Plan](./demo-plan.md)** - Complete presentation guide
- **[Prompts](./prompts.md)** - Sample prompts and use cases
- **[MCP Learnings](./demo-6-mcp-learnings.md)** - MCP integration patterns

## Demos in Action

### Autonomous Loop Example
```bash
cd autonomous-loop-demo
/ralph-loop:ralph-loop PROMPT.md --completion-promise COMPLETE --max-iterations 30

# Agent autonomously:
# - Reads PROMPT.md and test suite
# - Implements GET endpoints → runs tests → sees 7 passing
# - Implements POST endpoint → runs tests → sees 12 passing
# - Implements PUT endpoint → runs tests → sees 17 passing
# - Implements DELETE endpoint → runs tests → sees 19 passing ✅
# - Outputs <promise>COMPLETE</promise> → Ralph exits
```

### GitHub Actions CI/CD
```bash
cd autonomous-loop-demo-iac
git commit -m "feat: add products API [deploy-to-aws]"
git push origin my-branch

# GitHub Actions automatically:
# ✅ Runs unit tests (14 CDK assertions)
# 🚀 Deploys to AWS (DynamoDB + Lambda + API Gateway)
# ✅ Runs integration tests (15 tests against live API)
# 🧹 Destroys stack (cleanup)
```

## Use Cases

### ✅ Great For
- **Mechanical implementations** from clear specifications
- **Test-driven development** with objective criteria
- **CRUD operations** and boilerplate code
- **Infrastructure-as-Code** with multi-phase validation
- **Bug fixes** with regression tests
- **CI/CD automation** with deterministic verification

### ⚠️ Consider Carefully For
- Novel algorithm design (requires human judgment)
- Architecture decisions (needs domain expertise)
- Security-critical code (needs expert review)
- Subjective quality improvements (no deterministic verification)

## Contributing

This repository is for demonstration purposes. Feel free to fork and adapt for your own presentations or learning.

## Resources

- [Claude Code Documentation](https://code.claude.com)
- [Ralph Loop Plugin](https://github.com/frankbria/ralph-loop)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io)
- [GitHub Spec Kit](https://github.com/github/spec-kit)

## License

MIT

---

**Built to demonstrate the power of AI-assisted development workflows** 🚀

Key Insight: *AI agents excel at mechanical iteration but struggle to know when to stop. By making "done" deterministic and feeding failures back without filtering, we create self-correcting systems that persist until true completion.*
