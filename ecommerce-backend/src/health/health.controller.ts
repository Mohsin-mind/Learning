import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { Public } from '@/common/decorators/public.decorator';
import { APP_VERSION_TOKEN } from '@/common/constants/di-tokens.constant';

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(
    private readonly dataSource: DataSource,
    @Inject(APP_VERSION_TOKEN) private readonly version: string,
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
  @ApiOperation({ summary: 'Check if the API process is alive' })
  live() {
    return this.checkLive();
  }

  @Public()
  @Get('health/ready')
  @ApiOperation({ summary: 'Check if the API is ready to receive traffic' })
  async ready() {
    if (!this.dataSource.isInitialized) {
      throw new ServiceUnavailableException('Database is not initialized');
    }

    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      throw new ServiceUnavailableException('Database is not reachable');
    }

    return {
      status: 'ok',
      version: this.version,
      uptime: process.uptime(),
      checks: {
        database: 'up',
      },
    };
  }
}
