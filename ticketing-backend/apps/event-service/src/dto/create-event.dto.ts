// apps/event-service/src/events/dto/create-event.dto.ts
import {
  IsString,
  IsDateString,
  IsOptional,
  IsUrl,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ example: '2025 Coldplay World Tour' })
  @IsString()
  title: string;

  @ApiProperty({ example: '가슴 뛰는 전국 투어 공연 설명입니다.' })
  @IsString()
  description: string;

  @ApiProperty({
    example: 'https://cdn.example.com/thumb.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;

  @ApiProperty({ example: '2025-10-01T19:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2025-10-05T21:00:00.000Z' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: '2025-09-01T12:00:00.000Z' })
  @IsDateString()
  openAt: string;

  @ApiProperty({ example: '1c0e1c99-16a4-4f6e-bc8b-7dc42f81650c' })
  @IsUUID()
  venueId: string;
}
