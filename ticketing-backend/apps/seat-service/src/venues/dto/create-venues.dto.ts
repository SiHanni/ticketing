import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVenueDto {
  @ApiProperty({ example: '예술의 전당 콘서트홀' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '서울시 서초구 남부순환로 2406' })
  @IsString()
  @IsNotEmpty()
  address: string;
}
