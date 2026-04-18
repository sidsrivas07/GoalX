/**
 * Prisma Client Singleton
 *
 * Creates a single PrismaClient instance and reuses it across the app.
 * In development, nodemon restarts the server on every file change,
 * which would normally create a new PrismaClient each time and
 * exhaust database connections. This singleton pattern prevents that
 * by caching the instance on `globalThis`.
 */
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
