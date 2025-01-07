import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabase() {
  try {
    await prisma.$executeRawUnsafe(`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO ozzu;
      ALTER USER ozzu SET search_path TO public;
    `);
    console.log('Schema successfully reset!');
  } catch (err) {
    console.error('Error resetting schema:', err);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();

