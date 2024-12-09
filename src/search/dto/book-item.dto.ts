// src/search/dto/book-item.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class BookItemDto {
  @ApiProperty({ description: '도서 제목' })
  title: string;

  @ApiProperty({ description: '도서 링크' })
  link: string;

  @ApiProperty({ description: '도서 이미지 URL' })
  image: string;

  @ApiProperty({ description: '저자' })
  author: string;

  @ApiProperty({ description: '할인 금액', example: '9900' })
  discount: string;

  @ApiProperty({ description: '출판사' })
  publisher: string;

  @ApiProperty({ description: '출판 날짜', example: '20110729' })
  pubdate: string;

  @ApiProperty({ description: 'ISBN' })
  isbn: string;

  @ApiProperty({ description: '도서 설명' })
  description: string;
}
