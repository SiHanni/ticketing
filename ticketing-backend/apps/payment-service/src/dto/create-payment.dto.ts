import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PaymentMethod } from '../payments/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  userId: number;

  @ApiProperty({ example: 321 })
  @IsNumber()
  reservationId: number;

  @ApiProperty({ example: '백아' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CARD })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
