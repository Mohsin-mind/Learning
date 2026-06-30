import type { IPaymentsService } from './interfaces/payments-service.interface';
import { WebhookPayloadDto } from './dto/webhook-payload.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: IPaymentsService);
    webhook(dto: WebhookPayloadDto): any;
}
