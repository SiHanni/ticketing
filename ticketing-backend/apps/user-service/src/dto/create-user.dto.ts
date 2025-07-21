import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'alice@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securePassword123!' })
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '앨리스' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: '010-1234-5678',
    required: false,
    description: '대한민국 형식의 전화번호 (선택 항목)',
  })
  @IsPhoneNumber('KR')
  phone?: string;
}
