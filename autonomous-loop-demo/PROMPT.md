# Task: Implement Products API Endpoint

## Objective
Implement a complete REST API for products management in TypeScript/Express 5.x. All functionality is currently returning 501 Not Implemented. Your task is to implement all five endpoints to make the test suite pass.

## Current State
- ✅ Project structure is set up
- ✅ TypeScript types are defined
- ✅ Express app is configured
- ✅ Routes are registered
- ✅ Test suite is complete (19 tests)
- ❌ **All endpoint handlers return 501 Not Implemented**

## Acceptance Criteria

All tests in `tests/products.test.ts` MUST pass. The test suite includes:

### GET /api/products
- [ ] Returns empty array initially
- [ ] Returns all products after creation
- [ ] Response format: `{ success: true, data: Product[] }`

### GET /api/products/:id
- [ ] Returns 404 for non-existent product
- [ ] Returns specific product by ID
- [ ] Response format: `{ success: true, data: Product }`

### POST /api/products
- [ ] Creates new product with valid data
- [ ] Generates unique ID and createdAt timestamp
- [ ] Returns 400 if name is missing
- [ ] Returns 400 if price is missing
- [ ] Returns 400 if price is negative
- [ ] Returns 400 if category is missing
- [ ] Response format: `{ success: true, data: Product }` on success
- [ ] Status code 201 on success

### PUT /api/products/:id
- [ ] Updates existing product
- [ ] Sets updatedAt timestamp
- [ ] Returns 404 for non-existent product
- [ ] Returns 400 for invalid update data (e.g., negative price)
- [ ] Response format: `{ success: true, data: Product }`

### DELETE /api/products/:id
- [ ] Deletes existing product
- [ ] Returns 404 for non-existent product
- [ ] Product is actually removed (subsequent GET returns 404)
- [ ] Response format: `{ success: true, message: string }`

### Data Persistence
- [ ] Products persist across multiple operations (in-memory storage)

## Technical Requirements

1. **TypeScript Strict Mode**: All code must compile without errors
2. **No Type Errors**: Use proper TypeScript types (already defined in `src/types.ts`)
3. **In-Memory Storage**: Use the existing `products` array and `nextId` counter
4. **Proper HTTP Status Codes**:
   - 200 for successful GET, PUT, DELETE
   - 201 for successful POST
   - 400 for validation errors
   - 404 for not found
   - 500 for server errors
5. **Input Validation**:
   - name: required, non-empty string
   - price: required, must be positive number
   - category: required, non-empty string
6. **Error Messages**: Provide clear, descriptive error messages

## Implementation Guidance

The file `src/endpoints/products.ts` contains:
- All route handlers with TODO comments
- In-memory storage (`products` array and `nextId`)
- TypeScript interfaces imported from `src/types.ts`
- Detailed comments explaining what each endpoint should do

## Verification

After implementation, verify completion by running:

```bash
npm test
```

All 19 tests must pass with 0 failures.

## Completion Signal

When ALL tests pass and TypeScript compiles without errors, output EXACTLY this marker:

```
<promise>COMPLETE</promise>
```

**IMPORTANT**: Do not output this marker until you have verified that `npm test` shows all tests passing.

## How to Proceed

1. Read the current implementation in `src/endpoints/products.ts`
2. Implement each endpoint one by one
3. After each endpoint, run `npm test` to see which tests now pass
4. Continue until all 19 tests pass
5. Verify TypeScript compilation: `npm run build` (if available) or check for type errors
6. Output the completion marker

## Notes

- This is a demo project for autonomous agent workflows
- The test suite defines the exact behavior expected
- Focus on making tests pass, not on adding extra features
- The tests cover all edge cases and validation requirements
- In-memory storage is intentional (no database needed)
