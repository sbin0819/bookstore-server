// src/search/search.module.ts
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [HttpModule],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService], // Export SearchService
})
export class SearchModule {}
