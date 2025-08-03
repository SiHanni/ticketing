// QUEUE
export const QUEUE_RESERVATION_PREFIX = 'queue:reservation';

// TPS
export const TPS_LIMIT = 50; // 초당 입장 허용 인원 (테스트용)
export const ACTIVE_TTL = 300; // 입장 후 5분간 유효

export const BUCKET_CAPACITY = 100;
export const INTERVAL_MS = 1000;

// USER STATUS KEY
export const USER_STATUS_KEY = (eventId: number, userId: number) =>
  `user:${eventId}:${userId}:status`;

// ACTIVE EVENTS SET
export const ACTIVE_EVENTS_KEY = 'activeEvents';
