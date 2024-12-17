// src/events/dto/create-event.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({
    description: 'Title of the event',
    example: 'Tech Conference 2024',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the event',
    example: 'A comprehensive conference covering the latest in technology.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Start date of the event',
    example: '2024-05-01T09:00:00Z',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date of the event (must be after start date)',
    example: '2024-05-03T17:00:00Z',
  })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({
    description: 'URL of the event image',
    example: 'https://picsum.photos/300/200?random=1',
  })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}
