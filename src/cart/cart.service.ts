// src/cart/cart.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchService } from '../search/search.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    private searchService: SearchService,
  ) {}

  // 장바구니에 책 추가
  async addToCart(userId: number, createCartItemDto: CreateCartItemDto) {
    const { isbn, quantity } = createCartItemDto;

    // ISBN으로 Book 조회
    let book = await this.prisma.book.findUnique({
      where: { isbn },
    });

    // Book이 없으면 검색 후 생성
    if (!book) {
      const bookData = await this.searchService.searchByIsbn(isbn).toPromise();
      book = await this.prisma.book.create({
        data: {
          title: bookData.title,
          link: bookData.link,
          image: bookData.image,
          author: bookData.author,
          discount: bookData.discount,
          publisher: bookData.publisher,
          pubdate: bookData.pubdate,
          isbn: bookData.isbn,
          description: bookData.description,
        },
      });
    }

    // 장바구니에 동일한 책이 있는지 확인
    const existingCartItem = await this.prisma.cartItem.findFirst({
      where: { userId, bookId: book.id },
    });

    if (existingCartItem) {
      // 기존 책이 있다면 수량 업데이트
      return this.prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
      });
    }

    // 없으면 새로 추가
    return this.prisma.cartItem.create({
      data: { userId, bookId: book.id, quantity },
    });
  }

  // 특정 사용자의 장바구니 조회
  async getUserCart(userId: number) {
    return this.prisma.cartItem.findMany({
      where: { userId },
      include: { book: true }, // 책 정보 포함
    });
  }

  // 장바구니 아이템 수량 업데이트
  async updateCartItem(
    userId: number,
    cartItemId: number,
    updateCartItemDto: UpdateCartItemDto,
  ) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!cartItem || cartItem.userId !== userId) {
      throw new NotFoundException('Cart item not found');
    }

    return this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: updateCartItemDto.quantity },
    });
  }

  // 장바구니 아이템 삭제
  async removeCartItem(userId: number, cartItemId: number) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!cartItem || cartItem.userId !== userId) {
      throw new NotFoundException('Cart item not found');
    }

    return this.prisma.cartItem.delete({
      where: { id: cartItemId },
    });
  }

  // 장바구니 비우기
  async clearCart(userId: number) {
    return this.prisma.cartItem.deleteMany({
      where: { userId },
    });
  }
}
