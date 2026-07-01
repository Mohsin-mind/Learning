import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheckService,
  TypeOrmHealthIndicator,
  HealthCheck,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Public } from '@/common/decorators/public.decorator';
import { APP_VERSION_TOKEN } from '@/common/constants/di-tokens.constant';
import { QUEUES } from '@/common/constants/app.constants';

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly healthIndicatorService: HealthIndicatorService,
    @Inject(APP_VERSION_TOKEN) private readonly version: string,
    @InjectQueue(QUEUES.ORDERS) private readonly orderQueue: Queue,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Check API health' })
  checkLive() {
    return {
      status: 'ok',
      version: this.version,
      uptime: process.uptime(),
    };
  }

  @Public()
  @Get('health/live')
  @HealthCheck()
  @ApiOperation({ summary: 'Liveness probe' })
  live() {
    return this.health.check([]);
  }

  @Public()
  @Get('health/ready')
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness probe (includes database + Redis checks)' })
  ready() {
    return this.health.check([() => this.db.pingCheck('database'), () => this.checkRedis()]);
  }

  private async checkRedis() {
    const indicator = this.healthIndicatorService.check('redis');

    try {
      const redis = await this.orderQueue.client;
      await (redis as unknown as { ping: () => Promise<string> }).ping();
      return indicator.up();
    } catch (error) {
      return indicator.down({ message: (error as Error).message });
    }
  }
}
