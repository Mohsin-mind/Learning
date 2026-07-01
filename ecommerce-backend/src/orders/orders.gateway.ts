import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger, Inject } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';
import { authConfig } from '@/config/auth.config';

const WS_NAMESPACE = '/orders';

@WebSocketGateway({
  namespace: WS_NAMESPACE,
  cors: { origin: '*' },
})
export class OrdersGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(OrdersGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
  ) {}

  afterInit(server: Server) {
    server.use((socket, next) => {
      const token =
        (socket.handshake.auth?.token as string | undefined) ??
        extractBearerToken(socket.handshake.headers.authorization);

      if (!token) {
        return next(new Error('Missing auth token'));
      }

      try {
        const secret: string = this.config.jwtAccessSecret;
        const payload = verify(token, secret) as { sub: string };
        (socket as unknown as Record<string, unknown>).userId = payload.sub;
        next();
      } catch {
        next(new Error('Invalid or expired token'));
      }
    });
  }

  async handleConnection(client: Socket) {
    const userId = (client as unknown as Record<string, unknown>).userId as string | undefined;
    if (!userId) {
      client.disconnect();
      return;
    }

    await client.join(`user:${userId}`);
    this.logger.log(`WebSocket connected: user=${userId}, client=${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`WebSocket disconnected: client=${client.id}`);
  }

  notifyOrderStatus(userId: string, orderId: string, status: string) {
    this.server.to(`user:${userId}`).emit('orderStatusChanged', { orderId, status });
  }
}

function extractBearerToken(header: string | undefined): string | undefined {
  if (!header) return undefined;
  const parts = header.split(' ');
  return parts[0] === 'Bearer' && parts[1] ? parts[1] : undefined;
}
