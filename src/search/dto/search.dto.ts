// src/search/dto/search.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class SearchDto {
  @IsString()
  @ApiPropertyOptional({ required: true, description: '검색어' })
  query: string;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    required: false,
    description: '표시할 결과 수',
    example: 10,
  })
  display?: number;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    required: false,
    description: '검색 시작 위치',
    example: 1,
  })
  start?: number;

  @IsOptional()
  @IsIn(['sim', 'date'])
  @ApiPropertyOptional({
    required: false,
    description: '정렬 방식 (sim 또는 date)',
    example: 'sim',
  })
  sort?: string;
}
