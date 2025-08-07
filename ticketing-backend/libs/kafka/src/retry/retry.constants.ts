export const MAX_RETRY_COUNT = 3;

export const ORIGINAL_RESERVATION_REQUESTED_TOPIC = 'reservation.requested';
export const ORIGINAL_RESERVATION_PAID_TOPIC = 'reservation.paid';

/**
 * deprecated
 */
export const RETRY_TOPICS = [
  'retry.reservation.1',
  'retry.reservation.2',
  'retry.reservation.3',
];

export const RETRY_REQUESTED_TOPICS = [
  'retry.reservation.requested.1',
  'retry.reservation.requested.2',
  'retry.reservation.requested.3',
];

export const RETRY_PAID_TOPICS = [
  'retry.reservation.paid.1',
  'retry.reservation.paid.2',
  'retry.reservation.paid.3',
];

export const DLQ_TOPIC = 'reservation.dlq';

export const RETRY_HEADER_KEY = 'x-retry-count';

export const KAFKA_RETRY_QUEUE_KEY = 'kafka:retry:queue';

export const RETRY_DELAYS_MS = [1000, 5000, 10000];
