// src/categories/categories.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CategoryItem } from './interfaces/category.interface';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: '모든 카테고리 가져오기' })
  @ApiResponse({
    status: 200,
    description: '성공적으로 카테고리를 가져옵니다.',
  })
  getAllCategories(): CategoryItem[] {
    return this.categoriesService.getAllCategories();
  }
}
