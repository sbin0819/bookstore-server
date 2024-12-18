// src/cart/dto/update-cart-item.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({ description: '수량', example: 1 })
  @IsInt()
  @IsPositive()
  quantity: number;
}
