import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  @ApiOperation({ summary: 'Check API health' })
  checkLive() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health/live')
  @ApiOperation({ summary: 'Check if the API process is alive' })
  live() {
    return this.checkLive();
  }

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
      uptime: process.uptime(),
      checks: {
        database: 'up',
      },
      timestamp: new Date().toISOString(),
    };
  }
}
