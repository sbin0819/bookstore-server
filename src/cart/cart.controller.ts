// src/cart/cart.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@ApiTags('cart')
@ApiBearerAuth() // Swagger에 Bearer 토큰 인증 추가
@Controller('cart')
@UseGuards(AuthGuard('jwt'))
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @ApiOperation({ summary: '장바구니에 책 추가' })
  addToCart(@Req() req: any, @Body() createCartItemDto: CreateCartItemDto) {
    const userId = req.user.userId; // JWT 토큰에서 사용자 ID 추출
    return this.cartService.addToCart(userId, createCartItemDto);
  }

  @Get()
  @ApiOperation({ summary: '사용자의 장바구니 조회' })
  getUserCart(@Req() req: any) {
    const userId = req.user.userId;
    return this.cartService.getUserCart(userId);
  }

  @Put(':id')
  @ApiOperation({ summary: '장바구니 아이템 수량 업데이트' })
  updateCartItem(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    const userId = req.user.userId;
    return this.cartService.updateCartItem(userId, +id, updateCartItemDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '장바구니 아이템 삭제' })
  removeCartItem(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.cartService.removeCartItem(userId, +id);
  }

  @Delete()
  @ApiOperation({ summary: '장바구니 비우기' })
  clearCart(@Req() req: any) {
    const userId = req.user.userId;
    return this.cartService.clearCart(userId);
  }
}
