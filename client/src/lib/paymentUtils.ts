/**
 * Utilities for handling payment processing and preventing duplicate credit additions
 */

export type ProcessPaymentResult = {
  processed: boolean;
  paymentId: string;
  alreadyProcessed: boolean;
};

/**
 * Process a payment only if it hasn't been processed before
 * Uses localStorage to track processed payments across page reloads
 * 
 * @param timestamp Unique timestamp from the payment request
 * @returns Object with processing status
 */
export function processPaymentOnce(timestamp: string | null): ProcessPaymentResult {
  // No timestamp means no payment to process
  if (!timestamp) {
    return { processed: false, paymentId: '', alreadyProcessed: false };
  }
  
  // Generate a unique payment ID based on timestamp
  const paymentId = `payment_${timestamp}`;
  
  // Check if this payment was already processed (using localStorage)
  const alreadyProcessed = localStorage.getItem(paymentId) === 'processed';
  
  if (alreadyProcessed) {
    console.log(`Payment ${paymentId} was already processed - skipping processing`);
    return { processed: false, paymentId, alreadyProcessed: true };
  }
  
  // Mark this payment as processed to prevent duplicates
  localStorage.setItem(paymentId, 'processed');
  console.log(`Payment ${paymentId} marked as processed`);
  
  // Payment is being processed for the first time
  return { processed: true, paymentId, alreadyProcessed: false };
}

/**
 * Create a unique redirect URL with payment status and timestamp
 * 
 * @param status Payment status (usually 'completed')
 * @returns Fully qualified redirect URL
 */
export function createPaymentRedirectUrl(status: string = 'completed'): string {
  const timestamp = Date.now().toString();
  return `${window.location.origin}/account?payment_status=${status}&timestamp=${timestamp}`;
}
