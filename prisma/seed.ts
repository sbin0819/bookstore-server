// prisma/seed.ts

import { faker } from '@faker-js/faker';
import { Event, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Adds a specified number of days to a given date.
 * @param date - The original date.
 * @param days - Number of days to add.
 * @returns A new Date object with the added days.
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

async function main() {
  const events: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>[] = [];

  for (let i = 0; i < 40; i++) {
    const title = faker.lorem.words(faker.number.int({ min: 2, max: 5 }));
    const description = faker.lorem.sentences(
      faker.number.int({ min: 1, max: 3 }),
    );
    const startDate = faker.date.future();

    const endDateMax = addDays(startDate, 5);

    const endDate = endDateMax;

    // Generate a random image URL from Picsum Photos
    const width = faker.number.int({ min: 200, max: 400 });
    const height = faker.number.int({ min: 200, max: 400 });
    const imageUrl = `https://picsum.photos/${width}/${height}?random=${i}`;

    events.push({
      title,
      description,
      startDate,
      endDate,
      imageUrl,
    });
  }

  // Insert all events into the database
  await prisma.event.createMany({
    data: events,
  });

  console.log('✅ Seeded 40 events successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
