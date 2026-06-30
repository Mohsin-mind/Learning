import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import type { IPaymentsService } from './interfaces/payments-service.interface';
import { PAYMENTS_SERVICE_TOKEN } from './interfaces/payments-service.interface';
import { WebhookPayloadDto } from './dto/webhook-payload.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    @Inject(PAYMENTS_SERVICE_TOKEN)
    private readonly paymentsService: IPaymentsService,
  ) {}

  @Public()
  @Post('webhook')
  @ApiOperation({ summary: 'Simulate a payment webhook callback' })
  webhook(@Body() dto: WebhookPayloadDto) {
    return this.paymentsService.handleWebhook(dto);
  }
}
