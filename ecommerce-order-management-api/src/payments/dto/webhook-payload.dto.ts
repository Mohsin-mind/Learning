import { IsString, IsNumber, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WebhookPayloadDto {
  @ApiProperty({ example: 'order-uuid' })
  @IsString()
  orderId: string;

  @ApiProperty({ example: 'txn_123456' })
  @IsString()
  transactionId: string;

  @ApiProperty({ example: 99.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  success: boolean;
}
