# 🔄 Migration Guide: SaaS to Internal Payroll System

This document outlines the major changes made to refactor the project from a multi-tenant SaaS roster management system to an internal UK Care Agency payroll management system.

## Overview of Changes

### 1. Database Schema Changes

#### **Removed Models:**
- `Message` - Chat functionality removed (not priority for internal use)
- `Payment` - Stripe payment/subscription removed

#### **Added Models:**
- `Attendance` - Clock-in/out tracking with approval workflow
- `Payroll` - Automated payroll calculation with overtime support

#### **Updated Models:**

**User Model:**
- Added `address` field
- Added `hourlyRate` (Decimal) for payroll calculations
- Added `bankAccount` for payment processing
- Added `nationalInsuranceNumber` for UK HMRC compliance
- Removed message relations

**Company Model:**
- Removed all subscription fields (subscriptionPlan, subscriptionStatus, stripeCustomerId, etc.)
- Added `overtimeMultiplier` (default 1.5)
- Added `weeklyHoursThreshold` (default 40)
- Changed timezone default to "Europe/London"

**Shift Model:**
- Added `clientName` - Name of elderly/child client
- Added `clientNotes` - Special care instructions
- Added attendance relation

#### **Updated Enums:**

**UserRole:**
```prisma
enum UserRole {
  ADMIN           // Owner/Director (removed SUPER_ADMIN)
  MANAGER         // Schedulers
  ACCOUNTANT      // NEW - Finance team
  EMPLOYEE        // Carers, Babysitters
}
```

**New Enums:**
```prisma
enum AttendanceStatus {
  PENDING
  APPROVED
  REJECTED
}

enum PayrollStatus {
  DRAFT
  PENDING_APPROVAL
  APPROVED
  PAID
}
```

**Removed Enums:**
- `SubscriptionPlan`
- `SubscriptionStatus`
- `MessageType`

---

### 2. Backend API Changes

#### **New Controllers:**
- `attendance.controller.ts` - Clock-in/out, approval workflow
- `payroll.controller.ts` - Payroll CRUD, auto-generation, approval
- `reports.controller.ts` - Excel import/export

#### **Removed Controllers:**
- `payment.controller.ts`
- `message.controller.ts`

#### **New Routes:**
- `/api/attendance` - Attendance management
- `/api/payroll` - Payroll management
- `/api/reports` - Excel import/export operations

#### **Removed Routes:**
- `/api/payments`
- `/api/messages`

#### **Updated Controllers:**

**admin.controller.ts:**
- Added attendance and payroll stats to dashboard analytics
- Added overtime settings to company settings update
- Replaced payment count with payroll count

---

### 3. New Services

#### **excel.service.ts**
Provides comprehensive Excel import/export functionality:
- `importEmployeesFromExcel()` - Bulk import staff
- `exportEmployeesToExcel()` - Export staff list
- `exportPayrollToExcel()` - Export payroll with calculations
- `exportAttendanceToExcel()` - Export attendance report
- `importShiftsFromExcel()` - Bulk import shifts

Uses SheetJS (xlsx) library for Excel processing.

#### **Removed Services:**
- `stripe.service.ts`

---

### 4. Key Features Added

#### **Attendance Tracking**
- Manual clock-in/out recording
- Automatic total hours calculation (minus breaks)
- Manager approval workflow
- Status tracking (PENDING → APPROVED/REJECTED)

#### **Payroll Processing**
- Manual payroll entry with calculations
- Auto-generation from approved attendance records
- Overtime calculation based on company settings
- Support for bonuses and deductions
- Multi-step approval workflow (Manager → Paid)

#### **Excel Integration**
- Import employees with hourly rates
- Import shifts in bulk
- Export payroll summaries for accountants
- Export attendance reports for auditing

---

### 5. Environment Variables Changes

#### **Removed:**
```env
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_STARTER_PRICE_ID
STRIPE_PROFESSIONAL_PRICE_ID
STRIPE_ENTERPRISE_PRICE_ID
NEXT_PUBLIC_STRIPE_PUBLIC_KEY
```

#### **Kept (No Changes):**
```env
DATABASE_URL
REDIS_URL
JWT_SECRET
JWT_REFRESH_SECRET
JWT_EXPIRES_IN
JWT_REFRESH_EXPIRES_IN
FRONTEND_URL
NEXT_PUBLIC_API_URL
```

---

### 6. Migration Steps

#### **Step 1: Update Dependencies**

```bash
cd backend
npm install xlsx multer @types/multer
npm uninstall stripe
```

#### **Step 2: Reset Database**

```bash
# Drop existing database (if safe to do so)
cd backend
npx prisma migrate reset

# Or create a new migration
npx prisma migrate dev --name refactor_to_payroll_system
```

#### **Step 3: Generate Prisma Client**

```bash
npx prisma generate
```

#### **Step 4: Seed Database (Optional)**

Update `prisma/seed.ts` to include:
- Employees with hourly rates and bank details
- Sample attendance records
- Sample payroll records

```bash
npm run prisma:seed
```

#### **Step 5: Update Environment Variables**

Remove Stripe-related variables from `.env` files.

#### **Step 6: Test Backend**

```bash
npm run dev
```

Test new endpoints:
- `GET /api/attendance`
- `GET /api/payroll`
- `GET /api/reports/employees/export`

---

### 7. Frontend Updates Needed

The following frontend changes are required (marked as pending):

#### **Pages to Remove:**
- Subscription/pricing pages
- Payment history pages
- Chat/messaging pages

#### **Pages to Add:**
- Attendance dashboard
- Attendance clock-in/out interface
- Payroll management interface
- Payroll approval workflow
- Reports/export pages

#### **Components to Update:**
- Dashboard to show attendance & payroll stats
- Settings page to include overtime configuration
- Team page to include hourly rates

#### **Types to Add:**
```typescript
// frontend/types/index.ts
export interface Attendance {
  id: string;
  shiftId: string;
  userId: string;
  clockIn: string;
  clockOut?: string;
  totalHours?: number;
  breakDuration: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  // ...
}

export interface Payroll {
  id: string;
  userId: string;
  periodStart: string;
  periodEnd: string;
  regularHours: number;
  overtimeHours: number;
  hourlyRate: number;
  regularPay: number;
  overtimePay: number;
  bonuses: number;
  deductions: number;
  netPay: number;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'PAID';
  // ...
}
```

---

### 8. Testing Checklist

#### **Backend:**
- [ ] User creation with hourly rate and bank details
- [ ] Roster and shift creation with client information
- [ ] Attendance clock-in/out
- [ ] Attendance approval by manager
- [ ] Manual payroll creation
- [ ] Auto-generate payroll from attendance
- [ ] Payroll approval workflow
- [ ] Excel import employees
- [ ] Excel export payroll
- [ ] Excel export attendance
- [ ] Dashboard analytics with new stats

#### **Frontend:**
- [ ] Login/authentication
- [ ] Dashboard shows attendance & payroll stats
- [ ] Team management includes hourly rates
- [ ] Roster creation
- [ ] Shift assignment with client details
- [ ] Attendance tracking interface
- [ ] Payroll management interface
- [ ] Reports/export functionality

---

### 9. Security Considerations

#### **UK HMRC Compliance:**
- Store National Insurance numbers securely
- Implement proper access controls for payroll data
- Maintain audit logs for payroll changes
- Export payroll in HMRC-compatible formats

#### **Data Protection:**
- Bank account details stored encrypted
- Role-based access control strictly enforced
- Accountant role has limited access (payroll only, not roster editing)

---

### 10. Key Differences Summary

| Feature | Before (SaaS) | After (Internal) |
|---------|---------------|------------------|
| **Multi-tenancy** | Full multi-tenant | Single tenant focused |
| **Payments** | Stripe integration | No payment processing |
| **Subscription** | 3 tiers (Starter/Pro/Enterprise) | No subscription |
| **Chat** | Real-time messaging | Removed (not priority) |
| **Attendance** | Not present | Full clock-in/out system |
| **Payroll** | Not present | Automated with overtime |
| **Excel** | Not present | Import/export all data |
| **User Roles** | SUPER_ADMIN/ADMIN/MANAGER/EMPLOYEE | ADMIN/MANAGER/ACCOUNTANT/EMPLOYEE |
| **Compliance** | Generic | UK HMRC focused |
| **Timezone** | UTC default | Europe/London default |

---

### 11. Future Enhancements

Potential features to add:
- [ ] Advanced reporting with charts/graphs
- [ ] Email notifications for payroll approval
- [ ] Mobile app for clock-in/out
- [ ] Integration with accounting software (Xero, QuickBooks)
- [ ] Automatic backup to cloud storage
- [ ] Payslip generation (PDF)
- [ ] Holiday/leave tracking
- [ ] National Insurance calculations
- [ ] Tax deduction calculations

---

## Support

For questions about this migration, contact the development team.

**Developer:** Mohammad Kofil
**Project:** Roster & Payroll Management System
**Client:** UK-based Care Agency (Internal Use)

