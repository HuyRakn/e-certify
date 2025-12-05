/**
 * Retry Utilities với Exponential Backoff
 * 
 * Handle retry logic cho network errors và transaction failures
 */

export type RetryOptions = {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableErrors?: string[];
};

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableErrors: [
    'network',
    'timeout',
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    'transaction',
    'blockhash',
    'RPC',
  ],
};

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any, retryableErrors: string[] = DEFAULT_OPTIONS.retryableErrors): boolean {
  if (!error) return false;
  
  const errorMessage = (error.message || error.toString() || '').toLowerCase();
  const errorCode = (error.code || '').toLowerCase();
  
  return retryableErrors.some(
    (retryable) => errorMessage.includes(retryable.toLowerCase()) || errorCode.includes(retryable.toLowerCase())
  );
}

/**
 * Retry function với exponential backoff
 * 
 * @param fn Function to retry
 * @param options Retry options
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry if not retryable
      if (!isRetryableError(error, opts.retryableErrors)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === opts.maxRetries) {
        break;
      }

      // Calculate delay với exponential backoff
      const delay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt),
        opts.maxDelay
      );

      console.log(`⏳ Retry attempt ${attempt + 1}/${opts.maxRetries} after ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Retry với custom retry condition
 */
export async function retryWithCondition<T>(
  fn: () => Promise<T>,
  shouldRetry: (error: any, attempt: number) => boolean,
  options: Omit<RetryOptions, 'retryableErrors'> = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Check custom retry condition
      if (!shouldRetry(error, attempt)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === opts.maxRetries) {
        break;
      }

      // Calculate delay
      const delay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt),
        opts.maxDelay
      );

      console.log(`⏳ Retry attempt ${attempt + 1}/${opts.maxRetries} after ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

