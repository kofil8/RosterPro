import { PrismaClient } from "@prisma/client";

// Create a single Prisma Client instance with explicit datasource configuration
const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.DATABASE_URL ||
        "postgresql://admin:XMiJiKiMAy0eDcTDTlIM09lFzwnaMvSQ@dpg-d4aq0fripnbc73afme7g-a.singapore-postgres.render.com/roster_db_hm05",
    },
  },
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

// Handle graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prisma;
