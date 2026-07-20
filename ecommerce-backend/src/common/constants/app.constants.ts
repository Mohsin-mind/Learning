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

export const STAMPEDE_CACHE = {
  TTL: 60_000,
  STALE_TTL: 120_000,
  MUTEX_KEY: 'stampede:mutex:notes',
  PEE_KEY: 'dashboard:stampede:pee:notes',
  SWR_KEY: 'dashboard:stampede:swr:notes',
} as const;

export const CDC_CHANNELS = {
  DASHBOARD_NOTES: 'dashboard_notes_channel',
} as const;

export const ALGOLIA_INDEX = {
  PRODUCTS: 'products',
} as const;
