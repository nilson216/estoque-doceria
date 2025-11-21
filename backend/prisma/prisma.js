import { PrismaClient } from '@prisma/client';

// Provide the database connection URL to the client via constructor options
// (Prisma v6 supported passing the datasource url this way).
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
