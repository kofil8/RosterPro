// Quick database connection test with 127.0.0.1
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:postgres@127.0.0.1:5432/roster_db?schema=public',
    },
  },
  log: ['query', 'error', 'warn'],
});

async function testConnection() {
  try {
    console.log('Testing Prisma connection with 127.0.0.1...');
    
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
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

