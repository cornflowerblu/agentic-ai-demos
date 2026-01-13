# Autonomous Loop Demo - AWS CDK Infrastructure Implementation

## Objective

Implement a serverless Products API using AWS CDK (Infrastructure-as-Code) with deterministic multi-phase testing. The infrastructure deploys to AWS and must pass all integration tests against live resources before completion.

## Architecture

You will implement a serverless REST API with the following AWS resources:

- **DynamoDB Table**: Products table with partition key `id`
- **Lambda Function**: Node.js 24.x handler implementing CRUD operations
- **API Gateway**: REST API with proxy integration to Lambda

The CDK infrastructure is already defined in `lib/products-stack.ts`. Your task is to implement the Lambda handler in `lambda/index.ts` to satisfy all test requirements.

## Implementation Requirements

### Lambda Handler (`lambda/index.ts`)

Implement the following endpoints with DynamoDB integration:

1. **GET /products** - List all products
   - Use DynamoDB `ScanCommand`
   - Return: `{ success: true, data: Product[] }`

2. **GET /products/{id}** - Get product by ID
   - Use DynamoDB `GetCommand`
   - Return 404 if not found
   - Return: `{ success: true, data: Product }`

3. **POST /products** - Create new product
   - Validate: `name` (required), `price` (required, positive), `category` (required)
   - Generate: `id` (UUID), `createdAt` (ISO timestamp)
   - Use DynamoDB `PutCommand`
   - Return: `{ success: true, data: Product }` with status 201

4. **PUT /products/{id}** - Update existing product
   - Validate update data (price must be positive if provided)
   - Set `updatedAt` timestamp
   - Use DynamoDB `UpdateCommand`
   - Return 404 if product doesn't exist
   - Return: `{ success: true, data: Product }`

5. **DELETE /products/{id}** - Delete product
   - Use DynamoDB `DeleteCommand`
   - Return 404 if product doesn't exist
   - Return: `{ success: true, message: "Product deleted successfully" }`

### Product Interface

```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  createdAt: string;
  updatedAt?: string;
}
```

## Multi-Phase Completion Criteria

You must complete ALL phases in order. Each phase must succeed before proceeding to the next.

### Phase 1: Unit Tests (CDK Assertions)

**Command**: `npm run test:unit`

**Requirements**:
- All 12 CDK unit tests must pass
- Tests validate infrastructure configuration without deployment
- Fast feedback loop (~5 seconds)

**Validation**:
```bash
npm run test:unit
# Expected: PASS test/unit/products-stack.test.ts (12 tests)
```

### Phase 2: CDK Synthesis

**Command**: `npm run synth`

**Requirements**:
- CDK app must synthesize CloudFormation template without errors
- Validates infrastructure configuration
- Catches configuration issues before deployment

**Validation**:
```bash
npm run synth
# Expected: CloudFormation template output with no errors
```

### Phase 3: Deployment to AWS

**Command**: `npm run deploy`

**Requirements**:
- Deploy infrastructure to AWS account
- Deployment must complete successfully (~2-3 minutes)
- Outputs written to `cdk-outputs.json`
- API Gateway URL must be accessible

**Validation**:
```bash
npm run deploy
# Expected: Stack deployed successfully
# Expected: cdk-outputs.json created with ApiUrl
```

### Phase 4: Integration Tests (Live AWS Resources)

**Command**: `npm run test:integration`

**Requirements**:
- All 19 integration tests must pass
- Tests run against deployed API Gateway, Lambda, and DynamoDB
- Tests validate end-to-end functionality
- Automatic cleanup of test data in `afterAll()` hook

**Expected Test Results**:
```
GET /products
  ✓ should return empty array initially or array of products
  ✓ should return all products after creation

GET /products/{id}
  ✓ should return 404 for non-existent product
  ✓ should return a specific product by ID

POST /products
  ✓ should create a new product successfully
  ✓ should return 400 if name is missing
  ✓ should return 400 if price is missing
  ✓ should return 400 if price is negative
  ✓ should return 400 if category is missing

PUT /products/{id}
  ✓ should update an existing product
  ✓ should return 404 for non-existent product
  ✓ should return 400 if update data is invalid

DELETE /products/{id}
  ✓ should delete an existing product
  ✓ should return 404 for non-existent product

Data Persistence
  ✓ should maintain products across multiple operations

Test Suites: 1 passed, 1 total
Tests:       19 passed, 19 total
```

**Validation**:
```bash
npm run test:integration
# Expected: PASS test/integration/products-api.test.ts (19 tests)
```

### Phase 5: Cleanup

**Command**: `npm run destroy`

**Requirements**:
- Successfully destroy all AWS resources
- CloudFormation stack must be deleted
- No resources left in AWS account
- Cost control measure

**Validation**:
```bash
npm run destroy
# Expected: Stack ProductsStack successfully deleted
```

## Complete Workflow Verification

Run the full workflow with a single command:

```bash
npm run verify
```

This runs:
1. `npm run test:unit` (Phase 1)
2. `npm run deploy` (Phase 3)
3. `npm run test:integration` (Phase 4)
4. `npm run destroy` (Phase 5)

All steps must succeed for completion.

## Completion Signal

When ALL phases pass successfully, respond with:

```
<promise>COMPLETE</promise>
```

This marker signals successful autonomous loop completion.

## Development Workflow

### Iteration Loop

1. **Read test failures** - Check `npm run test:integration` output
2. **Implement missing functionality** - Update `lambda/index.ts`
3. **Test locally** - Run `npm run test:unit` for fast feedback
4. **Deploy to AWS** - Run `npm run deploy`
5. **Verify integration tests** - Run `npm run test:integration`
6. **Iterate** - Repeat until all 19 tests pass
7. **Cleanup** - Run `npm run destroy`
8. **Signal completion** - Return `<promise>COMPLETE</promise>`

### Pre-Flight Check

Before starting, validate AWS credentials:

```bash
npm run preflight
```

Expected output:
- AWS credentials valid
- Account ID displayed
- Region confirmed
- Cost estimate shown

### Emergency Cleanup

If deployment fails or gets stuck:

```bash
npm run cleanup
```

This runs `cdk destroy --force` and falls back to force cleanup script.

## Technical Constraints

1. **AWS Credentials Required**: Must have valid AWS credentials configured
   - AWS CLI: `aws configure`
   - Environment variables: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

2. **Node.js Version**: Node.js 24.x required

3. **DynamoDB Access**: Lambda needs environment variable `DYNAMODB_TABLE_NAME`

4. **API Gateway Integration**: Lambda must return proper APIGatewayProxyResult format

5. **CORS Headers**: All responses must include CORS headers for testing

6. **Error Handling**: Proper HTTP status codes (200, 201, 400, 404, 500)

## Cost Controls

- **Expected cost per run**: <$0.50 (mostly free tier)
- **DynamoDB**: Pay-per-request billing (no idle costs)
- **Lambda**: Minimal memory (256 MB), free tier eligible
- **API Gateway**: Free tier eligible
- **CRITICAL**: Always run `npm run destroy` after completion

## Common Issues & Solutions

### Issue: Integration tests fail with "cdk-outputs.json not found"
**Solution**: Run `npm run deploy` first to deploy the stack

### Issue: Tests fail with AWS credential errors
**Solution**: Run `npm run preflight` to validate credentials

### Issue: Lambda timeout errors
**Solution**: Check DynamoDB table name in environment variables

### Issue: CORS errors in tests
**Solution**: Ensure all Lambda responses include CORS headers

### Issue: Stack deletion fails
**Solution**: Run `npm run cleanup` for force deletion

## Success Criteria Summary

- ✅ Phase 1: All 12 unit tests pass
- ✅ Phase 2: CDK synth succeeds
- ✅ Phase 3: Stack deploys to AWS
- ✅ Phase 4: All 19 integration tests pass
- ✅ Phase 5: Stack destroyed successfully
- ✅ Completion signal: `<promise>COMPLETE</promise>`

## File Structure

```
autonomous-loop-demo-iac/
├── PROMPT.md                    # This file
├── lib/products-stack.ts        # CDK infrastructure (provided)
├── lambda/index.ts              # Lambda handler (YOU IMPLEMENT)
├── test/unit/                   # CDK assertion tests
└── test/integration/            # Live API tests (19 tests)
```

Focus your implementation on `lambda/index.ts`. The infrastructure is already complete and tested.

---

**Remember**: This is an autonomous loop demo. The completion criteria are deterministic and test-driven. All 19 integration tests must pass against live AWS resources before signaling completion.

Good luck! 🚀
