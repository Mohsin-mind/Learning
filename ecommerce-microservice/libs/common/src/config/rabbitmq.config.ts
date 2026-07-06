import { registerAs } from '@nestjs/config';

export default registerAs('rabbitmq', () => ({
  host: process.env.RABBITMQ_HOST ?? 'localhost',
  port: parseInt(process.env.RABBITMQ_PORT ?? '5672', 10),
  user: process.env.RABBITMQ_USER ?? 'user',
  pass: process.env.RABBITMQ_PASS ?? 'password',
  vhost: process.env.RABBITMQ_VHOST ?? '/',
  queue: process.env.RABBITMQ_QUEUE ?? 'order_events',
  get url(): string {
    return `amqp://${this.user}:${this.pass}@${this.host}:${this.port}${this.vhost}`;
  },
}));
