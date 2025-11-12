# ⚡ Quick Start Guide

Get the Roster & Payroll Management System running in 10 minutes.

---

## 🎯 What You're Building

A complete internal system for a UK-based care agency to:
- Track employee shifts and attendance
- Calculate payroll automatically
- Export reports to Excel
- Manage overtime and payments

---

## 📋 Prerequisites

Make sure you have installed:
- ✅ Node.js 20+ ([Download](https://nodejs.org))
- ✅ Docker Desktop ([Download](https://www.docker.com/products/docker-desktop))
- ✅ Git ([Download](https://git-scm.com))
- ✅ VS Code (recommended)

---

## 🚀 Step 1: Clone & Setup

```bash
# Clone the repository (or your fork)
git clone <repository-url>
cd Roster-Management-System

# Start PostgreSQL and Redis with Docker
docker-compose up -d postgres redis
```

---

## 🔧 Step 2: Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
# For Windows PowerShell:
Copy-Item .env.example .env
# For Mac/Linux:
# cp .env.example .env

# Edit .env file with your settings
# Required variables are already set in .env.example

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database with demo data
npm run prisma:seed

# Start the backend server
npm run dev
```

✅ Backend should now be running at `http://localhost:5001`

---

## 🎨 Step 3: Frontend Setup

Open a NEW terminal window:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file
# For Windows PowerShell:
Copy-Item .env.local.example .env.local
# For Mac/Linux:
# cp .env.local.example .env.local

# Edit .env.local (default values should work)
# NEXT_PUBLIC_API_URL=http://localhost:5001/api

# Start the frontend server
npm run dev
```

✅ Frontend should now be running at `http://localhost:3000`

---

## 🧪 Step 4: Test the System

### 1. Login

Open your browser to `http://localhost:3000`

**Demo Credentials:**
- **Admin:** admin@careagency.co.uk / password123
- **Manager:** manager@careagency.co.uk / password123
- **Accountant:** accountant@careagency.co.uk / password123
- **Carer:** carer1@careagency.co.uk / password123

### 2. Test Basic Features

✅ **Dashboard** - View statistics
✅ **Team** - Add/view employees
✅ **Rosters** - Create a roster
✅ **Shifts** - Add shifts to roster

### 3. Test New Features (Backend Ready)

Use Postman or curl to test new endpoints:

#### Create Attendance (Clock-In)
```bash
curl -X POST http://localhost:5001/api/attendance \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shiftId": "SHIFT_ID",
    "userId": "USER_ID",
    "clockIn": "2025-01-15T09:00:00Z"
  }'
```

#### Generate Payroll
```bash
curl -X POST http://localhost:5001/api/payroll/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "periodStart": "2025-01-01T00:00:00Z",
    "periodEnd": "2025-01-31T23:59:59Z"
  }'
```

#### Export Payroll to Excel
```bash
curl http://localhost:5001/api/reports/payroll/export \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output payroll.xlsx
```

📖 For complete API documentation, see `API_TESTING_GUIDE.md`

---

## 📦 Project Structure

```
Roster-Management-System/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   │   ├── attendance.controller.ts  ⭐ NEW
│   │   │   ├── payroll.controller.ts     ⭐ NEW
│   │   │   └── reports.controller.ts     ⭐ NEW
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # External services
│   │   │   └── excel.service.ts          ⭐ NEW
│   │   └── server.ts        # Main entry point
│   └── prisma/
│       └── schema.prisma    # Database schema ⭐ UPDATED
│
├── frontend/                # Next.js 14 React App
│   ├── app/                 # Pages
│   │   ├── dashboard/       # Main dashboard
│   │   ├── login/           # Auth pages
│   │   └── register/
│   └── types/               # TypeScript types ⭐ UPDATED
│
├── docker-compose.yml       # PostgreSQL + Redis
├── README.md                # Full documentation
├── MIGRATION_GUIDE.md       ⭐ NEW - Migration details
├── REFACTORING_SUMMARY.md   ⭐ NEW - Complete changes
├── API_TESTING_GUIDE.md     ⭐ NEW - API testing
└── QUICK_START.md           ⭐ This file
```

---

## 🎯 Key Concepts

### Roles & Permissions

| Role | Can Do |
|------|--------|
| **ADMIN** | Everything - full system access |
| **MANAGER** | Create rosters, approve attendance, approve payroll |
| **ACCOUNTANT** | Manage payroll, export reports |
| **EMPLOYEE** | View own shifts, clock in/out |

### Workflow

```
1. ADMIN creates employees with hourly rates
   ↓
2. MANAGER creates roster with shifts
   ↓
3. MANAGER assigns shifts to employees
   ↓
4. EMPLOYEE clocks in/out (creates attendance)
   ↓
5. MANAGER approves attendance
   ↓
6. ACCOUNTANT generates payroll from attendance
   ↓
7. MANAGER approves payroll
   ↓
8. ACCOUNTANT exports payroll to Excel for payment processing
```

---

## 🔍 Troubleshooting

### Backend won't start

**Error:** `Port 5000 already in use`
```bash
# Find and kill the process
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9
```

**Error:** `Cannot connect to database`
```bash
# Check if Docker containers are running
docker ps

# Restart containers
docker-compose restart postgres redis
```

### Frontend won't start

**Error:** `Port 3000 already in use`
```bash
# Change port in package.json:
"dev": "next dev -p 3001"
```

### Prisma errors

**Error:** `Prisma Client not generated`
```bash
cd backend
npm run prisma:generate
```

**Error:** `Database migration failed`
```bash
# Reset database (WARNING: Deletes all data)
npm run prisma:migrate reset

# Or create new migration
npm run prisma:migrate dev --name fix_schema
```

### Can't login

**Issue:** Invalid credentials

**Solution:** Run seed script again:
```bash
cd backend
npm run prisma:seed
```

---

## 📚 Next Steps

### For Development:

1. **Read Documentation:**
   - `README.md` - Complete project overview
   - `MIGRATION_GUIDE.md` - Detailed schema changes
   - `API_TESTING_GUIDE.md` - Test all endpoints

2. **Frontend Development:**
   - Create attendance pages
   - Create payroll management pages
   - Create reports/export pages
   - Update dashboard with new stats

3. **Testing:**
   - Write unit tests
   - Test payroll calculations
   - Test Excel import/export

### For Deployment:

1. **Production Setup:**
   - Set up production database
   - Configure environment variables
   - Enable SSL/TLS
   - Set up backups

2. **Deploy Backend:**
   - Railway, Render, or AWS
   - Add PostgreSQL and Redis add-ons
   - Configure environment variables
   - Run migrations

3. **Deploy Frontend:**
   - Vercel (recommended)
   - Update `NEXT_PUBLIC_API_URL`
   - Deploy

---

## 💡 Tips

1. **Development:**
   - Use VS Code with Prisma extension
   - Install ESLint and Prettier
   - Use Postman for API testing

2. **Database:**
   - Use Prisma Studio to view data: `npm run prisma:studio`
   - Backup regularly: `pg_dump`
   - Keep migrations in version control

3. **Security:**
   - Never commit `.env` files
   - Use strong JWT secrets in production
   - Enable HTTPS in production
   - Regular security updates

4. **Excel Files:**
   - Keep templates for import formats
   - Test with small batches first
   - Validate data before import

---

## 🆘 Getting Help

### Documentation:
- `README.md` - Full setup guide
- `MIGRATION_GUIDE.md` - Schema changes
- `API_TESTING_GUIDE.md` - API endpoints
- `REFACTORING_SUMMARY.md` - Feature list

### Common Issues:
- Check Docker containers are running
- Verify environment variables
- Check database migrations
- Review error logs

### Contact:
Developer: Mohammad Kofil
Project: Roster & Payroll Management System

---

## ✅ Checklist

Before going to production:

- [ ] All environment variables configured
- [ ] Database backed up
- [ ] SSL/TLS enabled
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Error logging set up
- [ ] Monitoring enabled
- [ ] Documentation updated
- [ ] Team trained on system
- [ ] Test data removed

---

## 🎉 Success!

You now have a fully functional Roster & Payroll Management System running locally!

**What's Working:**
✅ User authentication with JWT
✅ Employee management with payroll info
✅ Roster and shift management
✅ Attendance tracking (clock-in/out)
✅ Automated payroll calculation
✅ Excel import/export
✅ Role-based access control
✅ UK HMRC compliance ready

**Next:** Start building the frontend pages for attendance and payroll management.

---

*Happy Coding! 🚀*

