import { Prisma, PrismaClient, ShiftStatus, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create a demo company (UK-based Care Agency)
  const company = await prisma.company.create({
    data: {
      name: "CarePro UK Ltd",
      email: "info@carepro-uk.co.uk",
      phone: "+44 20 1234 5678",
      address: "123 High Street, London, SW1A 1AA, United Kingdom",
      timezone: "Europe/London",
      overtimeMultiplier: new Prisma.Decimal(1.5),
      weeklyHoursThreshold: 40,
    },
  });

  console.log("✅ Created demo company:", company.name);

  // Hash password for all users
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create admin user (Owner/Director)
  const admin = await prisma.user.create({
    data: {
      email: "admin@carepro-uk.co.uk",
      password: hashedPassword,
      firstName: "Sarah",
      lastName: "Mitchell",
      role: UserRole.ADMIN,
      phone: "+44 20 1234 5679",
      address: "456 Admin Avenue, London, SW1A 1AB",
      companyId: company.id,
      hourlyRate: new Prisma.Decimal(0), // Admin doesn't have hourly rate
      isActive: true,
    },
  });

  console.log("✅ Created admin user:", admin.email);

  // Create manager user (Scheduler)
  const manager = await prisma.user.create({
    data: {
      email: "manager@carepro-uk.co.uk",
      password: hashedPassword,
      firstName: "James",
      lastName: "Thompson",
      role: UserRole.MANAGER,
      phone: "+44 20 1234 5680",
      address: "789 Manager Road, London, SW1A 1AC",
      companyId: company.id,
      hourlyRate: new Prisma.Decimal(0), // Manager doesn't have hourly rate
      isActive: true,
    },
  });

  console.log("✅ Created manager user:", manager.email);

  // Create accountant user (Finance team)
  const accountant = await prisma.user.create({
    data: {
      email: "accountant@carepro-uk.co.uk",
      password: hashedPassword,
      firstName: "Emma",
      lastName: "Wilson",
      role: UserRole.ACCOUNTANT,
      phone: "+44 20 1234 5681",
      address: "321 Finance Street, London, SW1A 1AD",
      companyId: company.id,
      hourlyRate: new Prisma.Decimal(0), // Accountant doesn't have hourly rate
      isActive: true,
    },
  });

  console.log("✅ Created accountant user:", accountant.email);

  // Create employee users (Carers)
  const employees = await Promise.all([
    prisma.user.create({
      data: {
        email: "john.doe@carepro-uk.co.uk",
        password: hashedPassword,
        firstName: "John",
        lastName: "Doe",
        role: UserRole.EMPLOYEE,
        phone: "+44 20 1234 5682",
        address: "10 Carer Lane, London, SW1A 1AE",
        companyId: company.id,
        hourlyRate: new Prisma.Decimal(12.5),
        bankAccount: "GB82 WEST 1234 5698 7654 32",
        nationalInsuranceNumber: "AB123456C",
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "jane.smith@carepro-uk.co.uk",
        password: hashedPassword,
        firstName: "Jane",
        lastName: "Smith",
        role: UserRole.EMPLOYEE,
        phone: "+44 20 1234 5683",
        address: "20 Care Street, London, SW1A 1AF",
        companyId: company.id,
        hourlyRate: new Prisma.Decimal(13.0),
        bankAccount: "GB82 WEST 1234 5698 7654 33",
        nationalInsuranceNumber: "CD234567D",
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "bob.johnson@carepro-uk.co.uk",
        password: hashedPassword,
        firstName: "Bob",
        lastName: "Johnson",
        role: UserRole.EMPLOYEE,
        phone: "+44 20 1234 5684",
        address: "30 Worker Way, London, SW1A 1AG",
        companyId: company.id,
        hourlyRate: new Prisma.Decimal(12.75),
        bankAccount: "GB82 WEST 1234 5698 7654 34",
        nationalInsuranceNumber: "EF345678E",
        isActive: true,
      },
    }),
  ]);

  console.log("✅ Created employee users:", employees.length);

  // Create a roster for next week
  const nextWeekStart = new Date();
  nextWeekStart.setDate(nextWeekStart.getDate() + 7);
  nextWeekStart.setHours(0, 0, 0, 0);

  const nextWeekEnd = new Date(nextWeekStart);
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 6);
  nextWeekEnd.setHours(23, 59, 59, 999);

  const roster = await prisma.roster.create({
    data: {
      title: "Weekly Roster - Week of " + nextWeekStart.toLocaleDateString(),
      description: "Demo roster for the upcoming week",
      startDate: nextWeekStart,
      endDate: nextWeekEnd,
      isPublished: true,
      companyId: company.id,
    },
  });

  console.log("✅ Created roster:", roster.title);

  // Create shifts for the roster
  const shifts: Promise<any>[] = [];
  const clientNames = [
    "Mrs. Margaret Brown",
    "Mr. Robert Taylor",
    "Ms. Patricia Davis",
  ];
  const locations = [
    "123 Care Home Road",
    "456 Elderly Care Centre",
    "789 Home Care Address",
  ];

  for (let day = 0; day < 7; day++) {
    const shiftDate = new Date(nextWeekStart);
    shiftDate.setDate(shiftDate.getDate() + day);

    // Morning shift (9 AM - 5 PM)
    const morningStart = new Date(shiftDate);
    morningStart.setHours(9, 0, 0, 0);
    const morningEnd = new Date(shiftDate);
    morningEnd.setHours(17, 0, 0, 0);

    shifts.push(
      prisma.shift.create({
        data: {
          title: "Morning Care Shift",
          description: "Regular morning care shift",
          startTime: morningStart,
          endTime: morningEnd,
          location: locations[day % locations.length],
          clientName: clientNames[day % clientNames.length],
          clientNotes: "Assist with morning routine and medication",
          status: ShiftStatus.SCHEDULED,
          rosterId: roster.id,
          assignedUserId: employees[day % employees.length].id,
        },
      })
    );

    // Evening shift (5 PM - 1 AM next day)
    const eveningStart = new Date(shiftDate);
    eveningStart.setHours(17, 0, 0, 0);
    const eveningEnd = new Date(shiftDate);
    eveningEnd.setDate(eveningEnd.getDate() + 1);
    eveningEnd.setHours(1, 0, 0, 0); // Next day 1 AM

    shifts.push(
      prisma.shift.create({
        data: {
          title: "Evening Care Shift",
          description: "Regular evening care shift",
          startTime: eveningStart,
          endTime: eveningEnd,
          location: locations[(day + 1) % locations.length],
          clientName: clientNames[(day + 1) % clientNames.length],
          clientNotes: "Assist with evening routine and bedtime",
          status: ShiftStatus.SCHEDULED,
          rosterId: roster.id,
          assignedUserId: employees[(day + 1) % employees.length].id,
        },
      })
    );
  }

  const createdShifts = await Promise.all(shifts);
  console.log("✅ Created shifts:", createdShifts.length);

  console.log("");
  console.log("🎉 Seed completed successfully!");
  console.log("");
  console.log("📝 Demo Credentials (all passwords: password123):");
  console.log("   Admin: admin@carepro-uk.co.uk");
  console.log("   Manager: manager@carepro-uk.co.uk");
  console.log("   Accountant: accountant@carepro-uk.co.uk");
  console.log("   Employee 1: john.doe@carepro-uk.co.uk");
  console.log("   Employee 2: jane.smith@carepro-uk.co.uk");
  console.log("   Employee 3: bob.johnson@carepro-uk.co.uk");
  console.log("");
  console.log("📊 Summary:");
  console.log(`   - Company: ${company.name}`);
  console.log(
    `   - Users: ${
      1 + 1 + 1 + employees.length
    } (1 Admin, 1 Manager, 1 Accountant, ${employees.length} Employees)`
  );
  console.log(`   - Rosters: 1`);
  console.log(`   - Shifts: ${createdShifts.length}`);
  console.log("");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
