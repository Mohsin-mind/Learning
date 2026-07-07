export const RMQ_CLIENT_TOKEN = 'RMQ_CLIENT';

export const EVENTS = {
  ORDER_CREATED: 'order.created',
  ORDER_UPDATED: 'order.updated',
  ORDER_CANCELLED: 'order.cancelled',
  INVENTORY_LOW: 'inventory.low',
};

export const RMQ_QUEUES = {
  ORDER_EVENTS: 'order_events',
  RETRY: 'retry_queue',
  DEAD_LETTER: 'orders.dlq',
};

export const RMQ_EXCHANGES = {
  ORDERS: 'orders',
  DEAD_LETTER: 'orders.dlx',
  REDELIVER: 'orders.redeliver',
};

export const RMQ_ROUTING = {
  PREFIX: 'order.',
  RETRY: 'order.retry',
  DEAD: 'order.dead',
  EVENT_PATTERN: 'order.*',
};

export const RMQ_RETRY = {
  MAX_ATTEMPTS: 3,
  BACKOFF_MS: 5000,
};
