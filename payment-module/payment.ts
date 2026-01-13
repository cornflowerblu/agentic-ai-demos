/**
 * Payment Processing Module
 *
 * This module handles payment processing for the e-commerce platform.
 *
 * TODO: This module has several areas that could be improved during refactoring:
 * - Add proper TypeScript strict mode compliance
 * - Add OpenAPI annotations
 * - Improve error handling
 * - Add input validation
 * - Implement proper logging (without sensitive data)
 * - Add retry logic for transient failures
 * - Implement idempotency
 */

// REFACTOR: Should use proper TypeScript interfaces instead of 'any'
interface PaymentRequest {
  amount: number;
  currency: string;
  customerId: string;
  paymentMethod: any;  // TODO: Define proper PaymentMethod type
  metadata?: any;      // TODO: Define proper metadata type
}

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  // REFACTOR: Should include more detailed response fields
}

// SECURITY: API key should come from environment/secrets manager
// This is intentionally here to demonstrate security scanning
const PAYMENT_API_KEY = "sk_test_demo_key_not_real";  // TODO: Move to env vars

// REFACTOR: Should be configurable, not hardcoded
const PAYMENT_GATEWAY_URL = "https://api.payment-gateway.example.com";
const MAX_RETRIES = 3;
const TIMEOUT_MS = 30000;

/**
 * Process a payment transaction
 *
 * REFACTOR OPPORTUNITIES:
 * 1. Add OpenAPI annotation
 * 2. Add input validation
 * 3. Implement retry logic
 * 4. Add idempotency key support
 * 5. Improve error handling
 */
export async function processPayment(request: PaymentRequest): Promise<PaymentResult> {
  // SECURITY: Should validate input before processing
  // REFACTOR: No input validation - amounts could be negative!

  // PERFORMANCE: Should use connection pooling
  // REFACTOR: Creating new connection for each request

  // SECURITY: Logging sensitive payment data - BAD!
  console.log("Processing payment:", JSON.stringify(request));

  try {
    // REFACTOR: No timeout handling
    // REFACTOR: No retry logic for transient failures
    const response = await fetch(`${PAYMENT_GATEWAY_URL}/v1/charges`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${PAYMENT_API_KEY}`,  // SECURITY: Key in code
      },
      body: JSON.stringify({
        amount: request.amount,
        currency: request.currency,
        customer: request.customerId,
        payment_method: request.paymentMethod,
        metadata: request.metadata,
      }),
    });

    // REFACTOR: Should handle different HTTP status codes properly
    if (!response.ok) {
      // REFACTOR: Error message doesn't include enough context
      return {
        success: false,
        error: "Payment failed",
      };
    }

    const data = await response.json();

    // SECURITY: Logging transaction response - may contain sensitive data
    console.log("Payment response:", JSON.stringify(data));

    return {
      success: true,
      transactionId: data.id,
    };

  } catch (error) {
    // REFACTOR: Poor error handling - should categorize errors
    // REFACTOR: Should implement retry for network errors
    console.error("Payment error:", error);  // SECURITY: May log sensitive info

    return {
      success: false,
      error: "An error occurred",  // REFACTOR: Not helpful for debugging
    };
  }
}

/**
 * Refund a payment
 *
 * REFACTOR OPPORTUNITIES:
 * 1. Similar issues to processPayment
 * 2. Should verify original transaction exists
 * 3. Should prevent double refunds
 */
export async function refundPayment(
  transactionId: string,
  amount?: number  // REFACTOR: Optional partial refund amount - needs validation
): Promise<PaymentResult> {

  // SECURITY: No authorization check - anyone can refund!
  // REFACTOR: Should verify caller has permission

  // REFACTOR: No idempotency - could process same refund twice

  console.log(`Refunding transaction ${transactionId}`);  // OK - no sensitive data

  try {
    const response = await fetch(
      `${PAYMENT_GATEWAY_URL}/v1/refunds`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${PAYMENT_API_KEY}`,
        },
        body: JSON.stringify({
          charge: transactionId,
          amount: amount,  // REFACTOR: Undefined if not provided - is that OK?
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.message || "Refund failed",
      };
    }

    const data = await response.json();
    return {
      success: true,
      transactionId: data.id,
    };

  } catch (error) {
    // REFACTOR: Same poor error handling pattern
    return {
      success: false,
      error: "Refund failed",
    };
  }
}

/**
 * Get payment status
 *
 * PERFORMANCE: Should implement caching for frequently accessed transactions
 */
export async function getPaymentStatus(transactionId: string): Promise<any> {
  // REFACTOR: Returns 'any' - should have proper return type

  // PERFORMANCE: No caching - hits API every time
  // REFACTOR: Should validate transactionId format

  const response = await fetch(
    `${PAYMENT_GATEWAY_URL}/v1/charges/${transactionId}`,
    {
      headers: {
        "Authorization": `Bearer ${PAYMENT_API_KEY}`,
      },
    }
  );

  // REFACTOR: No error handling at all!
  return response.json();
}

/**
 * Validate payment method
 *
 * REFACTOR: This function has high cyclomatic complexity
 */
export function validatePaymentMethod(method: any): boolean {
  // REFACTOR: Using 'any' type
  // REFACTOR: Complex nested conditionals - should use early returns or separate functions

  if (method) {
    if (method.type === "card") {
      if (method.card) {
        if (method.card.number) {
          if (method.card.number.length >= 13 && method.card.number.length <= 19) {
            if (method.card.exp_month) {
              if (method.card.exp_year) {
                if (method.card.cvc) {
                  // SECURITY: Should not log card details!
                  console.log("Validating card:", method.card.number);
                  return true;
                }
              }
            }
          }
        }
      }
    } else if (method.type === "bank_account") {
      if (method.bank_account) {
        if (method.bank_account.routing_number && method.bank_account.account_number) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Calculate transaction fees
 *
 * REFACTOR: Magic numbers should be constants
 * DOCS: Missing documentation for fee structure
 */
export function calculateFees(amount: number, paymentMethod: string): number {
  // REFACTOR: Magic numbers - should be configurable constants
  // REFACTOR: No validation of amount (could be negative)

  let fee = 0;

  if (paymentMethod === "card") {
    fee = amount * 0.029 + 0.30;  // REFACTOR: Magic numbers
  } else if (paymentMethod === "bank") {
    fee = Math.min(amount * 0.008, 5.00);  // REFACTOR: Magic numbers
  } else if (paymentMethod === "wallet") {
    fee = amount * 0.025;  // REFACTOR: Magic numbers
  } else {
    fee = amount * 0.035;  // REFACTOR: Default fee - magic number
  }

  // REFACTOR: Floating point arithmetic issues - should use cents
  return Math.round(fee * 100) / 100;
}

/**
 * Batch process payments
 *
 * PERFORMANCE: Processes payments sequentially - should be parallel
 * REFACTOR: No progress tracking or partial failure handling
 */
export async function batchProcessPayments(
  payments: PaymentRequest[]
): Promise<PaymentResult[]> {

  const results: PaymentResult[] = [];

  // PERFORMANCE: Sequential processing - very slow for large batches!
  // REFACTOR: Should process in parallel with concurrency limit
  for (const payment of payments) {
    const result = await processPayment(payment);
    results.push(result);

    // REFACTOR: If one fails, should we continue? No clear strategy
    // REFACTOR: No progress callback or logging
  }

  return results;
}

// REFACTOR: Missing exports for some utility functions that might be needed
// DOCS: Missing module-level documentation
// TESTING: No test file exists for this module
