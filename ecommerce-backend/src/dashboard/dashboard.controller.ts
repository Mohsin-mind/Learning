import { Controller, Get, Post, Delete, Body, Inject } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Admin } from '@/common/decorators/admin.decorator';
import type { IDashboardService } from './interfaces/dashboard-service.interface';
import { DASHBOARD_SERVICE_TOKEN } from './interfaces/dashboard-service.interface';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(
    @Inject(DASHBOARD_SERVICE_TOKEN)
    private readonly dashboardService: IDashboardService,
  ) {}

  @Get('sales')
  @Admin()
  @ApiOperation({ summary: 'Get sales summary (Cache-Aside)' })
  getSalesSummary() {
    return this.dashboardService.getSalesSummary();
  }

  @Delete('sales/cache')
  @Admin()
  @ApiOperation({ summary: 'Invalidate sales cache (Granular Invalidation)' })
  invalidateSalesCache() {
    return this.dashboardService.invalidateSalesCache();
  }

  @Get('notes')
  @Admin()
  @ApiOperation({ summary: 'Get notes (Cache-Aside)' })
  getNotes() {
    return this.dashboardService.getNotes();
  }

  @Post('notes')
  @Admin()
  @ApiOperation({ summary: 'Create note — saves DB + updates cache (Write-Through)' })
  createNote(@Body('message') message: string) {
    return this.dashboardService.createNote(message);
  }

  @Post('notes/async')
  @Admin()
  @ApiOperation({ summary: 'Create note — caches immediately, persists DB in background (Write-Behind)' })
  createNoteAsync(@Body('message') message: string) {
    return this.dashboardService.createNoteAsync(message);
  }

  @Delete('notes/cache')
  @Admin()
  @ApiOperation({ summary: 'Invalidate notes cache (Granular Invalidation)' })
  invalidateNotesCache() {
    return this.dashboardService.invalidateNotesCache();
  }
}
