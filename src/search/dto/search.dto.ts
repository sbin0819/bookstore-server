// src/search/dto/search.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class SearchDto {
  @IsString()
  @ApiPropertyOptional({ required: true, description: '검색어' })
  query: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100) // Naver API의 최대 허용값에 맞게 설정
  @ApiPropertyOptional({
    required: false,
    description: '표시할 결과 수',
    example: 10,
  })
  display?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000) // Naver API의 최대 허용값에 맞게 설정s
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
