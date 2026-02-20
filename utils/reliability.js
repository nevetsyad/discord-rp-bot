function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientError(error) {
  if (!error) return false;

  const transientCodes = new Set([
    'ETIMEDOUT',
    'ECONNRESET',
    'ECONNREFUSED',
    'EHOSTUNREACH',
    'ENETUNREACH',
    'PROTOCOL_CONNECTION_LOST',
    'ER_LOCK_DEADLOCK',
    'ER_LOCK_WAIT_TIMEOUT'
  ]);

  if (error.code && transientCodes.has(String(error.code))) {
    return true;
  }

  const name = String(error.name || '');
  if (/Sequelize(Connection|Host|Timeout|ConnectionRefused|ConnectionError|ConnectionTimedOut)/.test(name)) {
    return true;
  }

  if (typeof error.status === 'number' && (error.status >= 500 || error.status === 429)) {
    return true;
  }

  const message = String(error.message || '').toLowerCase();
  return message.includes('timed out') || message.includes('timeout') || message.includes('temporarily');
}

async function retryWithBackoff(task, options = {}) {
  const {
    retries = 3,
    baseDelayMs = 500,
    maxDelayMs = 5000,
    factor = 2,
    jitter = 0.2,
    shouldRetry = isTransientError,
    onRetry = () => {},
    operation = 'operation'
  } = options;

  let attempt = 0;
  let lastError;

  while (attempt <= retries) {
    try {
      return await task(attempt);
    } catch (error) {
      lastError = error;
      const canRetry = attempt < retries && shouldRetry(error);
      if (!canRetry) {
        error.operation = operation;
        error.attempt = attempt + 1;
        throw error;
      }

      const exponential = Math.min(maxDelayMs, baseDelayMs * (factor ** attempt));
      const randomJitter = 1 + ((Math.random() * 2 - 1) * jitter);
      const delayMs = Math.max(1, Math.floor(exponential * randomJitter));

      onRetry({ attempt: attempt + 1, delayMs, error, operation });
      await sleep(delayMs);
      attempt++;
    }
  }

  throw lastError;
}

class CircuitBreakerLite {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 3;
    this.resetTimeoutMs = options.resetTimeoutMs || 30_000;
    this.state = 'closed';
    this.failures = 0;
    this.openedAt = 0;
  }

  canAttempt(now = Date.now()) {
    if (this.state === 'closed') return true;
    if (this.state === 'open' && (now - this.openedAt) >= this.resetTimeoutMs) {
      this.state = 'half-open';
      return true;
    }
    return this.state === 'half-open';
  }

  markSuccess() {
    this.state = 'closed';
    this.failures = 0;
    this.openedAt = 0;
  }

  markFailure(now = Date.now()) {
    this.failures += 1;
    if (this.failures >= this.failureThreshold) {
      this.state = 'open';
      this.openedAt = now;
    }
  }

  async execute(fn, options = {}) {
    if (!this.canAttempt()) {
      const err = new Error('Circuit breaker is open');
      err.code = 'CIRCUIT_OPEN';
      if (typeof options.fallback === 'function') return options.fallback(err);
      throw err;
    }

    try {
      const result = await fn();
      this.markSuccess();
      return result;
    } catch (error) {
      this.markFailure();
      throw error;
    }
  }
}

module.exports = {
  sleep,
  isTransientError,
  retryWithBackoff,
  CircuitBreakerLite
};