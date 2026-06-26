import { IsString, IsNumber, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Wireless Headphones' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Noise-cancelling Bluetooth headphones' })
  @IsString()
  description: string;

  @ApiProperty({ example: 99.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiProperty({ example: 50, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;
}
