// src/search/search.controller.ts
import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SearchDto } from './dto/search.dto';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: '네이버 도서 검색' })
  @ApiResponse({ status: 200, description: '검색 성공' })
  @ApiResponse({ status: 500, description: '서버 에러' })
  @UsePipes(new ValidationPipe({ transform: true }))
  search(@Query() searchDto: SearchDto) {
    const { query, display = 10, start = 1, sort = 'sim' } = searchDto;
    return this.searchService.search(query, display, start, sort);
  }
}
