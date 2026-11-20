import { v4 as uuidv4 } from 'uuid';

/**
 * Sinh UUID v4 gắn header 'Idempotency-Key' khi thanh toán (BR06)
 * Giúp triệt tiêu rủi ro thanh toán trùng lặp khi người dùng double click hoặc mạng lag.
 */
export function generateIdempotencyKey(): string {
  return uuidv4();
}

export function getIdempotencyHeaders(customKey?: string): { 'Idempotency-Key': string } {
  return {
    'Idempotency-Key': customKey || generateIdempotencyKey(),
  };
}
