export const RMQ_CLIENT_TOKEN = 'RMQ_CLIENT';

export const EVENTS = {
  ORDER_CREATED: 'order.created',
  ORDER_UPDATED: 'order.updated',
  ORDER_CANCELLED: 'order.cancelled',
  INVENTORY_LOW: 'inventory.low',
};

export const RMQ_QUEUES = {
  ORDER_EVENTS: 'order_events',
  DEAD_LETTER: 'orders.dlq',
};

export const RMQ_EXCHANGES = {
  DEAD_LETTER: 'orders.dlx',
};
