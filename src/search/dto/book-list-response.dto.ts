// src/search/dto/book-list-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { BookItemDto } from './book-item.dto';

export class BookListResponseDto {
  @ApiProperty({ description: '마지막 빌드 날짜' })
  lastBuildDate: string;

  @ApiProperty({ description: '전체 결과 수' })
  total: number;

  @ApiProperty({ description: '검색 시작 위치' })
  start: number;

  @ApiProperty({ description: '표시할 결과 수' })
  display: number;

  @ApiProperty({ description: '도서 항목 목록', type: [BookItemDto] })
  items: BookItemDto[];
}
