import { IsNumber, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReservationDto {
  @ApiProperty({ example: 1, description: 'User ID (숫자)' })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    example: 'seat-uuid-5678',
    description: '좌석 UUID',
  })
  @IsString()
  @IsNotEmpty()
  seatId: string;

  @ApiProperty({ example: 3, description: '이벤트 ID (숫자)' })
  @IsNumber()
  @IsNotEmpty()
  eventId: number;
}
