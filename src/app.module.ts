import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SearchModule } from './search/search.module';
import { CategoriesModule } from './categories/categories.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [SearchModule, CategoriesModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
