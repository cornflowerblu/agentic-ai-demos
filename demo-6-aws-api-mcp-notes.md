# AWS API MCP Server - Notes for Later Documentation

**Status**: Working! ✅
**Config Location**: `~/.claude.json` under project `/Users/rurich/Development/demos`

## Quick Summary

Unlike the other MCP servers (documentation-focused), this one **executes AWS CLI commands directly**.

## Tools Available

1. **call_aws** - Execute AWS CLI commands with validation
   - Example: `call_aws({ command: "sts get-caller-identity" })`
   - Returns structured JSON responses

2. **suggest_aws_commands** - Get AWS CLI command recommendations
   - Example: `suggest_aws_commands({ query: "How do I list Lambda functions?" })`
   - Returns up to 5 likely commands

3. **get_execution_plan** (Experimental) - Step-by-step guidance for complex tasks

## Configuration

```json
"awslabs-aws-api-mcp-server": {
  "type": "stdio",
  "command": "uvx",
  "args": ["awslabs.aws-api-mcp-server@latest"],
  "env": {
    "AWS_REGION": "us-east-1"
  }
}
```

**Important**: Must be configured at the **project level** in `.claude.json`, not globally.

## Troubleshooting Lesson

**Issue**: Server wasn't loading even after config + restart
**Root Cause**: MCP servers are per-project. I edited `/Users/rurich` project config, but we were in `/Users/rurich/Development/demos` project.
**Fix**: Added config to the correct project in `~/.claude.json`

## Test Command

```
call_aws({ command: "sts get-caller-identity" })
```

**Results**:
- Account: 712672311059
- Role: AdministratorAccess
- Region: us-east-1

## How This Enhances Demo 8

Instead of just using Bash for everything, can now:
- ✅ Verify CloudFormation stack status directly
- ✅ Check DynamoDB tables exist
- ✅ Invoke Lambda functions for testing
- ✅ Query DynamoDB for integration test validation
- ✅ Get AWS CLI suggestions when uncertain

**Key Limitation**: CDK commands (`cdk deploy`, `cdk destroy`) are NOT AWS CLI commands, so still need Bash for those.

## TODO

- [ ] Integrate AWS API MCP learnings into demo-6-mcp-learnings.md
- [ ] Show examples of how it was used in Demo 8
- [ ] Document the call_aws vs Bash tradeoffs
