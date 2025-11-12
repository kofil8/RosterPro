// Test local PostgreSQL connection
const { PrismaClient } = require('@prisma/client');

// Try different connection strings
const connectionStrings = [
  'postgresql://postgres@localhost:5432/postgres?schema=public',
  'postgresql://postgres:postgres@localhost:5432/postgres?schema=public',
  'postgresql://postgres:admin@localhost:5432/postgres?schema=public',
];

async function testConnection(url) {
  const prisma = new PrismaClient({
    datasources: { db: { url } },
    log: ['error'],
  });
  
  try {
    await prisma.$connect();
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log(`✅ SUCCESS with: ${url}`);
    console.log('Database version:', result[0].version);
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.log(`❌ Failed: ${url}`);
    console.log(`   Error: ${error.message.split('\n')[0]}`);
    await prisma.$disconnect();
    return false;
  }
}

async function main() {
  console.log('Testing local PostgreSQL connections...\n');
  
  for (const url of connectionStrings) {
    const success = await testConnection(url);
    if (success) {
      console.log(`\n✅ Working connection string: ${url}`);
      break;
    }
  }
}

main();

