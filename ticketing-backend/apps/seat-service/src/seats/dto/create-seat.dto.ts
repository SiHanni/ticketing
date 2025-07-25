import { IsNotEmpty, IsString, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSeatDto {
  @ApiProperty({ example: 'W7' })
  @IsString()
  @IsNotEmpty()
  section: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  row: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  fromNumber: number;

  @ApiProperty({ example: 30 })
  @IsInt()
  @Min(1)
  toNumber: number;

  @ApiProperty({ example: 'VIP', enum: ['VIP', 'R', 'S', 'A', 'B', 'C'] })
  @IsString()
  @IsNotEmpty()
  grade: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsOptional()
  @Min(1)
  floor: number;

  @ApiProperty({ example: 'venue-uuid-string' })
  @IsString()
  @IsNotEmpty()
  venueId: string;
}
