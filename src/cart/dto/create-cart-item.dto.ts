// src/cart/dto/create-cart-item.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsString } from 'class-validator';

export class CreateCartItemDto {
  @ApiProperty({ description: '도서 ISBN' })
  @IsString()
  isbn: string;

  @ApiProperty({ description: '수량', example: 1 })
  @IsInt()
  @IsPositive()
  quantity: number;
}
