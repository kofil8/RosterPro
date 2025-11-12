# 🏥 Roster & Payroll Management System

A comprehensive internal system for UK-based care agencies to manage employee rosters, shifts, attendance tracking, and payroll processing.

## 📋 Features

### Core Features
- ✅ **User Authentication** - Secure JWT-based authentication with refresh tokens
- ✅ **Employee Management** - Comprehensive staff profiles with payroll information
- ✅ **Roster Management** - Create, edit, and publish employee rosters
- ✅ **Shift Management** - Assign and manage shifts with client information
- ✅ **Attendance Tracking** - Clock-in/out system with approval workflow
- ✅ **Payroll Processing** - Automated payroll calculation with overtime support
- ✅ **Excel Import/Export** - Bulk import staff and export reports
- ✅ **Analytics Dashboard** - Real-time insights and statistics
- ✅ **UK HMRC Compliance** - Ready for UK tax and payroll requirements

### User Roles
- **Admin** - Owner/Director with full system access
- **Manager** - Roster and shift management, attendance approval
- **Accountant** - Payroll management and financial reporting
- **Employee** - Carers and babysitters (view shifts, clock in/out)

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 20+
- **Framework:** Express.js with TypeScript
- **Database:** PostgreSQL 15 with Prisma ORM
- **Cache/Sessions:** Redis 7
- **Excel Processing:** SheetJS (xlsx)
- **Authentication:** JWT with bcrypt
- **File Upload:** Multer

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui + Radix UI
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod
- **Animations:** Framer Motion

### DevOps
- **Containerization:** Docker + Docker Compose
- **Database Migrations:** Prisma Migrate
- **API Testing:** Postman/Insomnia

## 📁 Project Structure

```
roster-payroll-system/
├── backend/
│   ├── src/
│   │   ├── config/         # Database and Redis configuration
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── routes/         # API route definitions
│   │   ├── controllers/    # Business logic (attendance, payroll, reports)
│   │   ├── services/       # External services (JWT, email, Excel)
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Helper functions
│   │   └── server.ts       # Main server file
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Seed data
│   └── package.json
├── frontend/
│   ├── app/               # Next.js 14 App Router
│   ├── components/        # React components
│   ├── lib/              # Utilities and API client
│   ├── hooks/            # Custom React hooks
│   ├── store/            # Zustand state management
│   └── types/            # TypeScript types
├── docker-compose.yml
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15 (or use Docker)
- Redis 7 (or use Docker)

### Installation

#### 1. Clone the repository
```bash
git clone <repository-url>
cd roster-management-saas
```

#### 2. Start PostgreSQL and Redis with Docker
```bash
docker-compose up -d postgres redis
```

#### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env file with your configuration
# Required: DATABASE_URL, REDIS_URL, JWT_SECRET

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database with demo data
npm run prisma:seed

# Start development server
npm run dev
```

The backend will be available at `http://localhost:9001`

#### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Edit .env.local with your configuration
# NEXT_PUBLIC_API_URL=http://localhost:9001/api
# NEXT_PUBLIC_SOCKET_URL=http://localhost:9001

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Demo Credentials

After seeding the database, you can use these credentials:

- **Admin:** admin@careagency.co.uk / password123
- **Manager:** manager@careagency.co.uk / password123
- **Accountant:** accountant@careagency.co.uk / password123
- **Employee:** carer1@careagency.co.uk / password123

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user and company |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/change-password` | Change password |

### Roster Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/roster` | Create roster |
| GET | `/api/roster` | Get all rosters |
| GET | `/api/roster/:id` | Get roster by ID |
| PATCH | `/api/roster/:id` | Update roster |
| DELETE | `/api/roster/:id` | Delete roster |
| POST | `/api/roster/:id/publish` | Publish roster |

### Shift Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/shift` | Create shift |
| GET | `/api/shift` | Get all shifts |
| GET | `/api/shift/:id` | Get shift by ID |
| PATCH | `/api/shift/:id` | Update shift |
| DELETE | `/api/shift/:id` | Delete shift |
| POST | `/api/shift/:id/assign` | Assign user to shift |

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/user` | Create user |
| GET | `/api/user` | Get all users |
| GET | `/api/user/:id` | Get user by ID |
| PATCH | `/api/user/:id` | Update user |
| DELETE | `/api/user/:id` | Delete user |
| GET | `/api/user/:id/stats` | Get user statistics |

### Attendance Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/attendance` | Create attendance (clock-in) |
| GET | `/api/attendance` | Get all attendance records |
| GET | `/api/attendance/:id` | Get attendance by ID |
| PATCH | `/api/attendance/:id` | Update attendance (clock-out) |
| DELETE | `/api/attendance/:id` | Delete attendance (admin only) |
| POST | `/api/attendance/:id/approve` | Approve attendance |

### Payroll Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payroll` | Create payroll record |
| POST | `/api/payroll/generate` | Auto-generate payroll from attendance |
| GET | `/api/payroll` | Get all payroll records |
| GET | `/api/payroll/:id` | Get payroll by ID |
| PATCH | `/api/payroll/:id` | Update payroll |
| DELETE | `/api/payroll/:id` | Delete payroll (admin only) |
| POST | `/api/payroll/:id/approve` | Approve payroll |

### Reports Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/employees/export` | Export employees to Excel |
| POST | `/api/reports/employees/import` | Import employees from Excel |
| GET | `/api/reports/payroll/export` | Export payroll to Excel |
| GET | `/api/reports/attendance/export` | Export attendance to Excel |
| POST | `/api/reports/shifts/import` | Import shifts from Excel |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/analytics` | Get dashboard analytics |
| GET | `/api/admin/company/stats` | Get company statistics |
| GET | `/api/admin/activity` | Get recent activity |
| PATCH | `/api/admin/company/settings` | Update company settings |

## 🔐 Environment Variables

### Backend (.env)

```env
NODE_ENV=development
PORT=9001

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/roster_db?schema=public"
REDIS_URL=redis://localhost:6379

JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:3000

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM="RosterPro <noreply@rosterpro.com>"
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:9001/api
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📦 Deployment

### Backend Deployment (Railway/Render)

1. Create account on Railway or Render
2. Create new project and link GitHub repository
3. Add PostgreSQL and Redis services
4. Configure environment variables
5. Deploy

### Frontend Deployment (Vercel)

1. Create a Vercel account
2. Import GitHub repository
3. Configure environment variables (`NEXT_PUBLIC_API_URL`)
4. Deploy

> **Note:** This is an internal system designed for a single UK-based care agency. Consider deploying on a secure private network or VPN for additional security.

## 🔒 Security Best Practices

- ✅ JWT tokens with refresh token rotation
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Rate limiting on all endpoints
- ✅ CORS configuration
- ✅ Helmet.js security headers
- ✅ Input validation with Zod
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection
- ✅ CSRF token support

## 📊 Database Schema

The database schema includes:
- **Users** - Employee profiles with payroll information (hourly rate, bank details, NI number)
- **Companies** - Organization data with overtime settings
- **Rosters** - Weekly/monthly schedules
- **Shifts** - Individual work shifts with client information
- **Attendance** - Clock-in/out records with approval workflow
- **Payroll** - Salary calculations with regular/overtime hours
- **RefreshTokens** - JWT refresh tokens

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🎯 Project Objectives

This system was designed specifically for a UK-based care agency to:
- **Automate** manual Excel-based tracking
- **Ensure accuracy** in payroll calculations
- **Maintain compliance** with UK HMRC requirements
- **Reduce administrative** workload
- **Provide visibility** into workforce utilization

## 📝 License

This project is proprietary software developed for internal use.

## 📞 Support

For technical support, please contact the development team.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma team for the excellent ORM
- SheetJS for Excel processing capabilities
- All open-source contributors

---

**Developed by Mohammad Kofil - Full Stack Developer**

