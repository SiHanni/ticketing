import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: '결제 요청' })
  @ApiResponse({ status: 201, description: '결제 성공' })
  create(@Body() dto: CreatePaymentDto) {
    const { userId, reservationId } = dto;
    return this.paymentService.createAutoPayment(userId, reservationId);
  }
}
