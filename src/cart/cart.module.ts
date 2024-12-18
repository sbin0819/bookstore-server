// src/cart/cart.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchModule } from '../search/search.module';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  imports: [SearchModule],
  controllers: [CartController],
  providers: [CartService, PrismaService],
})
export class CartModule {}
