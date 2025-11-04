type TokenBucketState = {
  capacity: number;
  tokens: number;
  refillPerSec: number;
  lastRefill: number;
};

const buckets = new Map<string, TokenBucketState>();

export function createBucket(key: string, capacity: number, refillPerSec: number): void {
  if (buckets.has(key)) return;
  buckets.set(key, {
    capacity,
    tokens: capacity,
    refillPerSec,
    lastRefill: Date.now()
  });
}

export function tryRemoveToken(key: string): boolean {
  const state = buckets.get(key);
  if (!state) return false;
  const now = Date.now();
  const elapsed = (now - state.lastRefill) / 1000;
  const refill = Math.floor(elapsed * state.refillPerSec);
  if (refill > 0) {
    state.tokens = Math.min(state.capacity, state.tokens + refill);
    state.lastRefill = now;
  }
  if (state.tokens > 0) {
    state.tokens -= 1;
    return true;
  }
  return false;
}

