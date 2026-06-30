export const REGEX = {
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
} as const;

export const QUEUES = {
  ORDERS: 'orders',
} as const;

export const ORDER_JOBS = {
  CREATED: 'order.created',
  FAILED: 'order.failed',
  PAYMENT_PROCESSED: 'payment.processed',
} as const;

export const WORKER_EVENTS = {
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;
