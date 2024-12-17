// src/events/events.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { Event } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    // Ensure endDate is after startDate
    const start = new Date(createEventDto.startDate);
    const end = new Date(createEventDto.endDate);
    if (end <= start) {
      throw new Error('endDate must be after startDate');
    }

    return this.prisma.event.create({
      data: {
        ...createEventDto,
      },
    });
  }

  async findAll(paginationDto: PaginationDto): Promise<{
    data: Event[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }> {
    const { page = 1, take = 10 } = paginationDto;
    const skip = (page - 1) * take;

    // Fetch the events based on pagination
    const [data, totalCount] = await this.prisma.$transaction([
      this.prisma.event.findMany({
        skip,
        take,
        orderBy: {
          id: 'desc', // Optional: Order by creation date descending
        },
      }),
      this.prisma.event.count(),
    ]);

    const totalPages = Math.ceil(totalCount / take);

    return {
      data,
      totalCount,
      totalPages,
      currentPage: Number(page),
    };
  }

  async findOne(id: number): Promise<Event> {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }
}
