export const REGEX = {
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
} as const;

export const QUEUES = {
  ORDERS: 'orders',
  ORDERS_CQRS: 'orders-cqrs',
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

export const DASHBOARD_CACHE = {
  SALES_KEY: 'dashboard:sales',
  NOTES_KEY: 'dashboard:notes',
  TTL: 5 * 60 * 1000,
} as const;
