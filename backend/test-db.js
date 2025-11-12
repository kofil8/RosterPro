// Quick database connection test
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:postgres@localhost:5432/roster_db?schema=public',
    },
  },
  log: ['query', 'error', 'warn'],
});

async function testConnection() {
  try {
    console.log('Testing Prisma connection...');
    
    const userCount = await prisma.user.count();
    console.log('✅ Connection successful!');
    console.log(`Found ${userCount} users in database`);
    
    if (userCount > 0) {
      const users = await prisma.user.findMany({
        select: { id: true, email: true, role: true }
      });
      console.log('Users:', users);
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

