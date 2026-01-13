# Demo 6: MCP Servers - Key Learnings

**Date**: 2026-01-12
**MCP Servers Used**: Microsoft Learn, AWS Documentation, Context7

---

## 1. Microsoft Learn MCP - TypeScript Best Practices

### Query
"TypeScript strict mode best practices type safety 2026"

### Key Learnings

#### TypeScript Interface Usage for Type Safety
From Microsoft Entra SDK documentation:
- **Use TypeScript interfaces for API responses** to ensure type safety
- Catch errors at **compile time rather than runtime**
- Define interfaces for all external API contracts

#### Client Instance Reuse Pattern
```typescript
// ✅ CORRECT: Create single instance and reuse
const client = new SidecarClient();
// Use throughout application

// ❌ WRONG: Creating new instances per request
function makeRequest() {
  const client = new SidecarClient(); // Don't do this
}
```

**Why**: Improves performance and resource usage

#### Error Handling Best Practices
1. **Implement proper error handling and retry logic** for transient failures
2. **Distinguish between client errors (4xx) and server errors (5xx)**
3. Determine appropriate responses based on error type

#### Timeout Configuration
- Set appropriate timeouts based on downstream API latency
- Prevents application hanging indefinitely if SDK or service is slow

#### Connection Pooling
- Use HTTP agents to enable connection reuse across requests
- Reduces overhead and improves throughput

### TypeScript Strict Mode Features (Compared to JavaScript)

From the roadmap documentation:

1. **Strong Type System**: Every variable has a type that can't change
2. **Nullable Types**: Use `?` suffix for nullable types, compiler warns on potential null references
3. **Pattern Matching**: Rich `switch` expressions and `is` operators for type checking
4. **No Implicit 'any'**: Must explicitly type or assign identifiable types
   ```typescript
   // ❌ Bad: implicit any
   let value;

   // ✅ Good: explicit type
   let value: number;

   // ✅ Good: inferred type
   let value = 5;
   ```

---

## 2. AWS Documentation MCP - Lambda + DynamoDB Integration

### Query
Fetched: `https://docs.aws.amazon.com/lambda/latest/dg/with-ddb.html`

### Key Learnings

#### Lambda Polling Behavior for DynamoDB Streams

**Polling Rate**: 4 times per second per shard

**Batching Window**:
- Default: Invoke immediately when records available (even if just 1 record)
- Configurable: Buffer records for up to **5 minutes** before invoking
- Batching stops when:
  - Full batch gathered
  - Batching window expires
  - Batch reaches **6 MB payload limit**

#### Critical: Idempotency Required

> ⚠️ **Warning from AWS**: Lambda event source mappings process each event **at least once**, and duplicate processing of records can occur.

**Solution**: Make function code idempotent
- Reference: [How do I make my Lambda function idempotent](https://repost.aws/knowledge-center/lambda-function-idempotent)

#### Partial Batch Response Pattern

**Problem**: When some records in a batch fail, successfully processed records get retried

**Solution**: Implement partial batch response logic
- **Recommended Tool**: [Batch Processor utility](https://docs.powertools.aws.dev/lambda/python/latest/utilities/batch/) from Powertools for AWS Lambda
- Available in: Python, TypeScript, .NET, Java
- Automatically handles partial batch response logic

#### Parallelization for High Throughput

**ParallelizationFactor Setting**:
- Range: 1 (default) to 10
- Allows processing one shard with multiple concurrent Lambda invocations
- Example: `ParallelizationFactor = 2` → up to 200 concurrent invocations for 100 shards
- **Maintains in-order processing** at the item (partition + sort key) level

**When to use**: When data volume is volatile and IteratorAge is high

#### Stream Starting Positions

**Two Options**:
1. **LATEST**: Start from most recent records
   - ⚠️ Risk: May miss events during creation/updates (eventually consistent)
2. **TRIM_HORIZON**: Start from oldest records
   - ✅ Recommended: Ensures no events are missed

**Why**: Stream polling during event source mapping creation/updates is **eventually consistent** (takes several minutes)

#### Simultaneous Readers Limit

- **Single-Region tables**: Up to 2 Lambda functions can read from same shard
- **Global tables**: Limit to 1 function per shard (avoid throttling)

#### Example Event Structure

```json
{
  "Records": [
    {
      "eventID": "1",
      "eventVersion": "1.0",
      "dynamodb": {
        "Keys": {
          "Id": { "N": "101" }
        },
        "NewImage": {
          "Message": { "S": "New item!" },
          "Id": { "N": "101" }
        },
        "StreamViewType": "NEW_AND_OLD_IMAGES",
        "SequenceNumber": "111",
        "SizeBytes": 26
      },
      "awsRegion": "us-west-2",
      "eventName": "INSERT",
      "eventSourceARN": "arn:aws:dynamodb:us-east-2:123456789012:table/my-table/stream/2024-06-10T19:26:16.525",
      "eventSource": "aws:dynamodb"
    }
  ]
}
```

**Key Fields**:
- `eventName`: INSERT, MODIFY, or REMOVE
- `dynamodb.Keys`: Primary key of the item
- `dynamodb.NewImage`: Item after modification
- `dynamodb.OldImage`: Item before modification (for MODIFY/REMOVE)
- `StreamViewType`: What data is included (NEW_AND_OLD_IMAGES, KEYS_ONLY, etc.)

---

## 3. Context7 MCP - AWS SDK v3 DynamoDB Code Examples

### Library Resolved
**Library ID**: `/websites/aws_amazon_amazondynamodb_developerguide`
- **Code Snippets**: 6,867 available
- **Source Reputation**: High
- **Benchmark Score**: 68.2

### Query
"TypeScript SDK v3 put item get item query DynamoDB client example"

### Key Learnings

#### Modern AWS SDK v3 Pattern

**Required Packages**:
```json
{
  "dependencies": {
    "@aws-sdk/client-dynamodb": "^3.x",
    "@aws-sdk/lib-dynamodb": "^3.x"
  }
}
```

**Standard Setup Pattern**:
```typescript
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
```

**Why Document Client**: Simplifies item operations (no need to specify types like `{ S: "string" }`)

#### PutCommand - Create/Update Item

```typescript
import { PutCommand } from "@aws-sdk/lib-dynamodb";

const command = new PutCommand({
  TableName: "HappyAnimals",
  Item: {
    CommonName: "Shiba Inu",
  },
});

const response = await docClient.send(command);
```

**Key Points**:
- `Item` is plain JavaScript object (Document Client handles type conversion)
- Automatically overwrites if item with same key exists

#### GetCommand - Retrieve Single Item

```typescript
import { GetCommand } from "@aws-sdk/lib-dynamodb";

const command = new GetCommand({
  TableName: "AngryAnimals",
  Key: {
    CommonName: "Shoebill",
  },
});

const response = await docClient.send(command);
```

**Key Points**:
- Must specify exact primary key
- Returns `undefined` if item doesn't exist (not an error)

#### QueryCommand - Filter by Key Conditions

```typescript
import { QueryCommand } from "@aws-sdk/lib-dynamodb";

const command = new QueryCommand({
  TableName: "CoffeeCrop",
  KeyConditionExpression:
    "OriginCountry = :originCountry AND RoastDate > :roastDate",
  ExpressionAttributeValues: {
    ":originCountry": "Ethiopia",
    ":roastDate": "2023-05-01",
  },
  ConsistentRead: true,
});

const response = await docClient.send(command);
console.log(response.Items); // Array of matching items
```

**Key Points**:
- `KeyConditionExpression`: Must include partition key, optionally sort key
- Use `:placeholder` syntax for values (prevents injection)
- `ConsistentRead: true` for strongly consistent reads (default is eventually consistent)
- Returns `Items` array (empty if no matches)

#### Advanced Query with begins_with

```typescript
const command = new QueryCommand({
  TableName: "products",
  IndexName: "GSI1",  // Query on Global Secondary Index
  KeyConditionExpression: "#category = :category and begins_with(#sku, :sku)",
  ExpressionAttributeNames: {
    "#category": "category",
    "#sku": "sku",
  },
  ExpressionAttributeValues: {
    ":category": "footwear",
    ":sku": "hiking",
  },
});
```

**Key Points**:
- Use `ExpressionAttributeNames` when attribute names are reserved words
- `begins_with()` function for prefix matching on sort key
- Can query on GSI (Global Secondary Index) with `IndexName`

#### Error Handling Pattern

```typescript
try {
  const response = await docClient.send(command);
  console.log(response.Items);
  return response.Items;
} catch (error) {
  console.error("Error querying DynamoDB:", error);
  throw error; // Re-throw for upstream handling
}
```

---

## Summary: What MCP Servers Provide

### Microsoft Learn MCP
- ✅ Official Microsoft/Azure documentation
- ✅ TypeScript best practices from SDK teams
- ✅ Architecture patterns and design guidelines
- ✅ Language feature comparisons (TypeScript vs C#, etc.)

### AWS Documentation MCP
- ✅ Complete AWS service documentation
- ✅ Integration patterns (Lambda + DynamoDB, etc.)
- ✅ Performance tuning guidance
- ✅ Security and reliability best practices

### Context7 MCP
- ✅ Actual code examples from official docs
- ✅ Library-specific patterns and idioms
- ✅ Latest SDK versions and APIs
- ✅ Real-world usage examples

## Key Insight

**MCP servers bring authoritative, up-to-date documentation directly into the development workflow**, eliminating context switching to browser tabs and ensuring you're using current best practices.

This is especially valuable for:
1. **Verifying latest patterns** before implementing
2. **Finding working code examples** quickly
3. **Checking breaking changes** in new versions
4. **Learning best practices** from official sources
