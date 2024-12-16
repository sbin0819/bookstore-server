import { Injectable } from '@nestjs/common';
import { Event } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(event: Event) {
    return this.prisma.event.create({
      data: {
        ...event,
      },
    });
  }

  async findAll() {
    return this.prisma.event.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} event`;
  }
}
