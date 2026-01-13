# Autonomous Loop Demo - AWS CDK Infrastructure-as-Code

This demo extends the [autonomous-loop-demo](../autonomous-loop-demo) to showcase Infrastructure-as-Code (IaC) development with AWS CDK and TypeScript. It demonstrates an autonomous agent implementing serverless infrastructure with deterministic multi-phase testing.

## Overview

The demo implements a serverless **Products API** using AWS CDK that deploys to your AWS account. An autonomous agent (Claude Code with Ralph) iteratively implements the Lambda handler to satisfy 19 integration tests against live AWS resources.

### Architecture

```
┌─────────────────┐
│  API Gateway    │ ← REST API endpoints
│  (Regional)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Lambda         │ ← Node.js 24.x handler
│  (Products API) │   (Agent implements)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  DynamoDB       │ ← Products table
│  (PAY_PER_REQ)  │   Partition key: id
└─────────────────┘
```

**Infrastructure Components**:
- **DynamoDB Table**: `products-{stackName}` with partition key `id`
- **Lambda Function**: Node.js 24.x implementing CRUD operations
- **API Gateway**: REST API with CORS enabled for testing
- **IAM Role**: Lambda execution role with DynamoDB read/write permissions

## Multi-Phase Testing Strategy

Unlike the original demo (single test phase), this demo uses **multi-phase testing** to mirror real-world IaC workflows:

### Phase 1: Unit Tests (CDK Assertions)
- **Purpose**: Validate infrastructure configuration without deployment
- **Command**: `npm run test:unit`
- **Duration**: ~5 seconds
- **Tests**: 12 CDK assertion tests
- **Validates**: DynamoDB config, Lambda runtime, API Gateway setup, IAM permissions

### Phase 2: CDK Synthesis
- **Purpose**: Ensure CloudFormation template generation succeeds
- **Command**: `npm run synth`
- **Duration**: ~3 seconds
- **Validates**: CDK app configuration, no synthesis errors

### Phase 3: Deployment to AWS
- **Purpose**: Deploy infrastructure to live AWS account
- **Command**: `npm run deploy`
- **Duration**: ~2-3 minutes
- **Output**: `cdk-outputs.json` with API Gateway URL

### Phase 4: Integration Tests (Live AWS)
- **Purpose**: Test deployed API against live resources
- **Command**: `npm run test:integration`
- **Duration**: ~10-15 seconds
- **Tests**: 19 integration tests covering all CRUD operations
- **Validates**: API Gateway → Lambda → DynamoDB flow

### Phase 5: Cleanup
- **Purpose**: Destroy all AWS resources to avoid costs
- **Command**: `npm run destroy`
- **Duration**: ~2-3 minutes
- **Result**: All CloudFormation resources deleted

## Getting Started

### Prerequisites

1. **Node.js 24.x** or later
2. **AWS Account** with credentials configured
3. **AWS CLI** (optional but recommended)
4. **npm** or **yarn** package manager

### AWS Credentials Setup

Configure AWS credentials using one of these methods:

**Option 1: AWS CLI** (Recommended)
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter default region (e.g., us-east-1)
```

**Option 2: Environment Variables**
```bash
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_REGION="us-east-1"
```

**Option 3: AWS SSO**
```bash
aws sso login --profile your-profile
export AWS_PROFILE="your-profile"
```

### Verify AWS Credentials

Run pre-flight check:

```bash
cd /Users/rurich/Development/demos/autonomous-loop-demo-iac
npm install
npm run preflight
```

Expected output:
```
🔍 Pre-Flight Check: Validating AWS credentials...

✅ AWS credentials valid
   Account: 123456789012
   User/Role: arn:aws:iam::123456789012:user/yourname
   Region: us-east-1

💰 Cost Estimate for Complete Run:
   - DynamoDB (on-demand): ~$0.10
   - Lambda invocations: Free tier
   - API Gateway requests: Free tier
   - TOTAL: <$0.50 (mostly free tier)

⚠️  IMPORTANT: Always run "npm run destroy" after completion!
   Leaving resources deployed may incur ongoing costs.

✅ Pre-flight check passed. Ready to proceed.
```

## Demo Flow (8-10 minutes)

This demo is designed for live presentations with pre-warmed snapshots to avoid waiting for deployments.

### Full Run (15-20 minutes)

Complete autonomous loop from scratch:

```bash
# 1. Install dependencies
npm install

# 2. Verify AWS credentials
npm run preflight

# 3. Run autonomous agent
/ralph-loop PROMPT.md --completion-promise COMPLETE --max-iterations 30

# Agent will:
# - Run unit tests (pass immediately - infrastructure correct)
# - Deploy to AWS (~2-3 minutes)
# - Run integration tests (fail - Lambda not implemented)
# - Iteratively implement Lambda handler
# - Re-deploy and test until all 19 tests pass
# - Destroy stack and signal completion

# 4. Verify completion
npm run test:integration  # All 19 tests pass
```

### Pre-Warmed Demo (8-10 minutes)

For live demos, use pre-warmed snapshots:

```bash
# 1. Show initial state (all endpoints return 501)
npm run demo:reset
npm run deploy
npm run test:integration  # All fail

# 2. Load pre-warmed state (iteration 4 - partial implementation)
npm run demo:prewarm
npm run deploy

# 3. Run autonomous agent (only 4-5 iterations needed)
/ralph-loop PROMPT.md --completion-promise COMPLETE --max-iterations 30

# Agent sees 7 failing tests and completes remaining endpoints

# 4. Verify final state
npm run test:integration  # All 19 pass
npm run destroy           # Cleanup
```

### Manual Workflow (Development)

Test implementation manually:

```bash
# 1. Unit tests (fast feedback)
npm run test:unit

# 2. Synthesize CloudFormation
npm run synth

# 3. Deploy to AWS
npm run deploy

# 4. Integration tests (live AWS)
npm run test:integration

# 5. Cleanup
npm run destroy
```

### GitHub Actions Workflow (CI/CD)

This demo includes a GitHub Actions workflow (`.github/workflows/cdk-autonomous-deployment.yml`) that runs the entire multi-phase deployment automatically in the cloud.

**Features**:
- **Manual trigger only** (`workflow_dispatch`) - no accidental AWS charges
- **AWS OIDC authentication** - no long-lived secrets required
- **Safety flag** - requires explicit opt-in to deploy (`deploy_to_aws=true`)
- **Guaranteed cleanup** - destroys stack even if tests fail
- **Cost-conscious** - unit tests always run (free), deployment optional

**Setup**:

1. Configure AWS OIDC provider in your AWS account
2. Add `AWS_DEMO_ROLE_ARN` secret to GitHub repository
3. Trigger workflow manually from Actions tab

**Usage**:

```bash
# Option 1: Trigger via GitHub UI
# 1. Go to Actions tab
# 2. Select "Autonomous CDK Deployment"
# 3. Click "Run workflow"
# 4. Set deploy_to_aws=true
# 5. Watch execution

# Option 2: Trigger via GitHub CLI
gh workflow run cdk-autonomous-deployment.yml \
  -f deploy_to_aws=true

# Option 3: Dry run (unit tests only, no AWS)
gh workflow run cdk-autonomous-deployment.yml \
  -f deploy_to_aws=false
```

**What the workflow does**:
1. ✅ Runs unit tests (always)
2. 🚀 Deploys to AWS (if `deploy_to_aws=true`)
3. ✅ Runs integration tests (if deployed)
4. 🧹 Destroys stack (always runs, even on failure)
5. 📊 Uploads artifacts (CDK outputs, test results)

**Cost estimate**: Same as local run (~$0.50 per execution with deployment)

**Comparison: Local vs GitHub Actions**

| Aspect | Local (Ralph) | GitHub Actions |
|--------|---------------|----------------|
| **Control** | Full terminal control | Cloud automation |
| **Setup** | AWS CLI + credentials | OIDC role + secrets |
| **Trigger** | Manual command | Manual or automated |
| **Visibility** | Terminal output | GitHub UI + logs |
| **Cost** | AWS charges only | AWS + GitHub minutes |
| **Cleanup** | Manual | Guaranteed (always) |
| **Best for** | Development, demos | CI/CD, automation |

## Cost Estimates

### Per Run (Complete Workflow)
- **DynamoDB**: ~$0.10 (on-demand pricing, minimal reads/writes)
- **Lambda**: Free tier (100 invocations)
- **API Gateway**: Free tier (20 requests)
- **CloudFormation**: Free
- **Total**: **<$0.50** (mostly free tier)

### If Left Running (24 hours)
- **DynamoDB**: ~$0.01/day (on-demand with no traffic)
- **Lambda**: $0.00 (no invocations)
- **API Gateway**: $0.00 (no requests)
- **Total**: **~$0.30/month**

**CRITICAL**: Always run `npm run destroy` after completion to avoid unnecessary costs!

## Implementation Details

### File Structure

```
autonomous-loop-demo-iac/
├── README.md                              # This file
├── PROMPT.md                              # Agent instructions
├── package.json                           # Dependencies & scripts
├── cdk.json                               # CDK configuration
├── tsconfig.json                          # TypeScript config
│
├── .ralph/
│   └── config.json                        # Ralph autonomous loop config
│
├── bin/
│   └── app.ts                             # CDK app entry point
│
├── lib/
│   └── products-stack.ts                  # CDK stack (infrastructure)
│
├── lambda/
│   ├── index.ts                           # Lambda handler (agent implements)
│   ├── package.json                       # Lambda dependencies
│   └── tsconfig.json                      # Lambda TypeScript config
│
├── test/
│   ├── unit/
│   │   └── products-stack.test.ts         # 12 CDK assertion tests
│   └── integration/
│       └── products-api.test.ts           # 19 live API tests
│
├── scripts/
│   ├── pre-flight-check.ts                # AWS credentials validation
│   └── force-cleanup.ts                   # Emergency cleanup
│
└── demo-snapshots/
    ├── iteration-0-skeleton.ts            # Starting point (501 responses)
    ├── iteration-4-partial.ts             # Pre-warmed (GET/POST working)
    └── iteration-8-complete.ts            # Final implementation (all pass)
```

### NPM Scripts

```json
{
  "preflight": "ts-node scripts/pre-flight-check.ts",
  "test:unit": "jest test/unit --verbose",
  "test:integration": "jest test/integration --runInBand --verbose",
  "test": "npm run test:unit && npm run test:integration",
  "build": "tsc",
  "synth": "cdk synth",
  "deploy": "cdk deploy --require-approval never --outputs-file cdk-outputs.json",
  "destroy": "cdk destroy --force",
  "cleanup": "npm run destroy || ts-node scripts/force-cleanup.ts",
  "verify": "npm run test:unit && npm run deploy && npm run test:integration && npm run destroy",
  "demo:reset": "cp demo-snapshots/iteration-0-skeleton.ts lambda/index.ts",
  "demo:prewarm": "cp demo-snapshots/iteration-4-partial.ts lambda/index.ts",
  "demo:complete": "cp demo-snapshots/iteration-8-complete.ts lambda/index.ts"
}
```

### Integration Tests Overview

The 19 integration tests validate:

**GET /products** (2 tests)
- Returns array of products
- Maintains all created products

**GET /products/{id}** (2 tests)
- Returns 404 for non-existent product
- Returns specific product by ID

**POST /products** (5 tests)
- Creates product successfully
- Validates required field: name
- Validates required field: price
- Validates price is positive
- Validates required field: category

**PUT /products/{id}** (3 tests)
- Updates existing product
- Returns 404 for non-existent product
- Validates update data (e.g., price positive)

**DELETE /products/{id}** (2 tests)
- Deletes existing product
- Returns 404 for non-existent product

**Data Persistence** (1 test)
- Maintains products across multiple operations

### Ralph Configuration

The `.ralph/config.json` configures the autonomous loop:

- **Max Iterations**: 30 (deployments are expensive)
- **Session Timeout**: 2 hours
- **Completion Marker**: `<promise>COMPLETE</promise>`
- **Test Command**: `npm run verify` (full workflow)
- **Circuit Breaker**: Prevents runaway loops
- **Hooks**: Pre-flight check before starting, cleanup after

## Troubleshooting

### Issue: "AWS credentials not configured"
**Solution**:
```bash
npm run preflight  # Diagnose credential issues
aws configure      # Set up credentials
```

### Issue: "cdk-outputs.json not found"
**Solution**:
```bash
npm run deploy     # Deploy stack first
```

### Issue: Integration tests timeout
**Cause**: DynamoDB table name not set in Lambda environment
**Solution**: Check `lib/products-stack.ts` - environment variable should be set

### Issue: Stack deletion fails
**Solution**:
```bash
npm run cleanup    # Force cleanup
# OR manually:
aws cloudformation delete-stack --stack-name ProductsStack
```

### Issue: "Stack already exists" error
**Cause**: Previous deployment wasn't cleaned up
**Solution**:
```bash
npm run destroy    # Clean up first
npm run deploy     # Deploy again
```

### Issue: Tests fail with CORS errors
**Cause**: Lambda responses missing CORS headers
**Solution**: Ensure all responses include:
```typescript
{
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization'
}
```

## Comparison with Original Demo

| Aspect | Original Demo | IaC Demo |
|--------|--------------|----------|
| **Domain** | Express.js REST API | AWS CDK Serverless |
| **Runtime** | Local Node.js | AWS Lambda + API Gateway |
| **Database** | In-memory array | DynamoDB |
| **Tests** | 19 integration tests | 12 unit + 19 integration |
| **Test Phases** | 1 (integration) | 4 (unit → synth → deploy → integration) |
| **Duration** | ~2 minutes | ~8-10 minutes (pre-warmed) |
| **Cost** | $0 | <$0.50 per run |
| **Cleanup** | N/A | Required (AWS resources) |
| **Pre-warming** | 2 snapshots | 3 snapshots |

## Advanced Usage

### Running Specific Test Suites

```bash
# Unit tests only (fast)
npm run test:unit

# Integration tests only (requires deployed stack)
npm run test:integration

# All tests
npm run test
```

### Manual Deployment Workflow

```bash
# 1. Build TypeScript
npm run build

# 2. Synthesize CloudFormation template
npm run synth

# 3. Deploy with manual approval
cdk deploy

# 4. Deploy without approval (CI/CD)
cdk deploy --require-approval never

# 5. View outputs
cat cdk-outputs.json
```

### Debugging Lambda Handler

```bash
# View Lambda logs
aws logs tail /aws/lambda/ProductsStack-ProductsApiHandler --follow

# Invoke Lambda directly
aws lambda invoke \
  --function-name ProductsStack-ProductsApiHandler \
  --payload '{"httpMethod":"GET","path":"/products"}' \
  response.json
cat response.json
```

### Monitoring Deployment

```bash
# Watch CloudFormation events
aws cloudformation describe-stack-events \
  --stack-name ProductsStack \
  --max-items 10

# Check stack status
aws cloudformation describe-stacks \
  --stack-name ProductsStack \
  --query 'Stacks[0].StackStatus'
```

## Security Considerations

1. **AWS Credentials**: Never commit AWS credentials to git
2. **IAM Permissions**: Lambda has minimal permissions (DynamoDB read/write only)
3. **API Gateway**: CORS enabled for testing (restrict in production)
4. **DynamoDB**: No encryption at rest (enable for production)
5. **CloudFormation**: Stack uses default IAM role (consider custom role)

## Contributing

This demo is part of the autonomous-loop-demo series. To contribute:

1. Test changes with full autonomous loop
2. Ensure all 31 tests pass (12 unit + 19 integration)
3. Verify cleanup works correctly
4. Update snapshots if workflow changes

## License

MIT

## Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [Original Autonomous Loop Demo](../autonomous-loop-demo)
- [Ralph (Autonomous Loop Runner)](https://github.com/anthropic/ralph)
- [Claude Code](https://claude.ai/code)

---

**Remember**: Always run `npm run destroy` after demos to avoid AWS costs!

For questions or issues, check the [Troubleshooting](#troubleshooting) section above.
