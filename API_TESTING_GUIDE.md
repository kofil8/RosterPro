# 🧪 API Testing Guide

Complete guide for testing all new endpoints in the Roster & Payroll Management System.

---

## Prerequisites

1. Backend running at `http://localhost:5001`
2. Database migrated with new schema
3. Valid JWT access token (obtain via login)

---

## Authentication

### 1. Login
```http
POST http://localhost:5001/api/auth/login
Content-Type: application/json

{
  "email": "admin@careagency.co.uk",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_123",
      "email": "admin@careagency.co.uk",
      "firstName": "Admin",
      "lastName": "User",
      "role": "ADMIN"
    }
  }
}
```

**Copy the `accessToken` and use it in all subsequent requests as:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## Attendance Endpoints

### 1. Create Attendance (Clock-In)

```http
POST http://localhost:5001/api/attendance
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "shiftId": "shift_123",
  "userId": "user_456",
  "clockIn": "2025-01-15T09:00:00Z",
  "breakDuration": 0.5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance record created successfully",
  "data": {
    "id": "att_789",
    "shiftId": "shift_123",
    "userId": "user_456",
    "clockIn": "2025-01-15T09:00:00.000Z",
    "clockOut": null,
    "totalHours": null,
    "breakDuration": 0.5,
    "status": "PENDING"
  }
}
```

### 2. Update Attendance (Clock-Out)

```http
PATCH http://localhost:5001/api/attendance/att_789
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "clockOut": "2025-01-15T17:00:00Z",
  "breakDuration": 0.5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance record updated successfully",
  "data": {
    "id": "att_789",
    "clockIn": "2025-01-15T09:00:00.000Z",
    "clockOut": "2025-01-15T17:00:00.000Z",
    "totalHours": 7.5,
    "status": "PENDING"
  }
}
```

### 3. Get All Attendance Records

```http
GET http://localhost:5001/api/attendance
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Query Parameters:**
- `userId` - Filter by user ID
- `shiftId` - Filter by shift ID
- `status` - Filter by status (PENDING, APPROVED, REJECTED)
- `startDate` - Filter from date (ISO format)
- `endDate` - Filter to date (ISO format)

**Example:**
```http
GET http://localhost:5001/api/attendance?status=PENDING&startDate=2025-01-01
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 4. Get Single Attendance Record

```http
GET http://localhost:5001/api/attendance/att_789
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 5. Approve Attendance (Manager/Admin)

```http
POST http://localhost:5001/api/attendance/att_789/approve
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance approved successfully",
  "data": {
    "id": "att_789",
    "status": "APPROVED",
    "approvedBy": "user_123",
    "approvedAt": "2025-01-16T10:00:00.000Z"
  }
}
```

### 6. Delete Attendance (Admin Only)

```http
DELETE http://localhost:5001/api/attendance/att_789
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## Payroll Endpoints

### 1. Create Payroll Record

```http
POST http://localhost:5001/api/payroll
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "userId": "user_456",
  "companyId": "company_123",
  "periodStart": "2025-01-01T00:00:00Z",
  "periodEnd": "2025-01-31T23:59:59Z",
  "regularHours": 160,
  "overtimeHours": 10,
  "hourlyRate": 12.50,
  "bonuses": 50,
  "deductions": 25,
  "notes": "January payroll"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payroll record created successfully",
  "data": {
    "id": "pay_456",
    "userId": "user_456",
    "periodStart": "2025-01-01T00:00:00.000Z",
    "periodEnd": "2025-01-31T23:59:59.000Z",
    "regularHours": 160,
    "overtimeHours": 10,
    "hourlyRate": 12.50,
    "regularPay": 2000.00,
    "overtimePay": 187.50,
    "bonuses": 50.00,
    "deductions": 25.00,
    "netPay": 2212.50,
    "status": "DRAFT"
  }
}
```

### 2. Auto-Generate Payroll from Attendance

```http
POST http://localhost:5001/api/payroll/generate
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "userId": "user_456",
  "periodStart": "2025-01-01T00:00:00Z",
  "periodEnd": "2025-01-31T23:59:59Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payroll generated successfully. Total hours: 170 (Regular: 160, Overtime: 10)",
  "data": {
    "id": "pay_789",
    "userId": "user_456",
    "regularHours": 160,
    "overtimeHours": 10,
    "netPay": 2187.50,
    "status": "PENDING_APPROVAL"
  }
}
```

### 3. Get All Payroll Records

```http
GET http://localhost:5001/api/payroll
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Query Parameters:**
- `userId` - Filter by user ID
- `companyId` - Filter by company ID
- `status` - Filter by status
- `periodStart` - Filter from date
- `periodEnd` - Filter to date

### 4. Get Single Payroll Record

```http
GET http://localhost:5001/api/payroll/pay_456
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 5. Update Payroll Record

```http
PATCH http://localhost:5001/api/payroll/pay_456
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "bonuses": 100,
  "deductions": 50,
  "notes": "Updated with performance bonus"
}
```

### 6. Approve Payroll (Manager/Admin)

```http
POST http://localhost:5001/api/payroll/pay_456/approve
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 7. Delete Payroll (Admin Only)

```http
DELETE http://localhost:5001/api/payroll/pay_456
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## Reports Endpoints

### 1. Export Employees to Excel

```http
GET http://localhost:5001/api/reports/employees/export
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:** Excel file download
**Filename:** `employees-2025-01-15.xlsx`

### 2. Import Employees from Excel

```http
POST http://localhost:5001/api/reports/employees/import
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: multipart/form-data

file: [Excel file with employee data]
```

**Excel Format:**
| firstName | lastName | email | phone | address | hourlyRate | bankAccount | nationalInsuranceNumber |
|-----------|----------|-------|-------|---------|------------|-------------|------------------------|
| John | Doe | john@example.com | 07123456789 | 123 Main St | 12.50 | 12345678-12345678 | AB123456C |

**Response:**
```json
{
  "success": true,
  "message": "Successfully imported 5 employees. 0 failed.",
  "data": {
    "success": true,
    "imported": 5,
    "failed": 0
  }
}
```

### 3. Export Payroll to Excel

```http
GET http://localhost:5001/api/reports/payroll/export?periodStart=2025-01-01&periodEnd=2025-01-31
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Query Parameters:**
- `periodStart` - Optional: Start date filter
- `periodEnd` - Optional: End date filter

**Response:** Excel file download
**Filename:** `payroll-2025-01-15.xlsx`

**Excel Columns:**
- Employee Name
- Email
- Period Start
- Period End
- Regular Hours
- Overtime Hours
- Hourly Rate
- Regular Pay
- Overtime Pay
- Bonuses
- Deductions
- Net Pay
- Status

### 4. Export Attendance to Excel

```http
GET http://localhost:5001/api/reports/attendance/export?startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:** Excel file download
**Filename:** `attendance-2025-01-15.xlsx`

### 5. Import Shifts from Excel

```http
POST http://localhost:5001/api/reports/shifts/import
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: multipart/form-data

file: [Excel file with shift data]
rosterId: roster_123
```

**Excel Format:**
| title | description | startTime | endTime | location | clientName | clientNotes | assignedUserEmail |
|-------|-------------|-----------|---------|----------|------------|-------------|------------------|
| Morning Shift | Care for elderly client | 2025-01-15 09:00:00 | 2025-01-15 17:00:00 | 123 Care Home | Mrs. Smith | Diabetes care | carer@example.com |

---

## Testing Workflow

### Scenario 1: Complete Attendance to Payroll Flow

1. **Create Shift**
```http
POST /api/shift
{
  "title": "Morning Care Shift",
  "startTime": "2025-01-15T09:00:00Z",
  "endTime": "2025-01-15T17:00:00Z",
  "location": "Client Home",
  "clientName": "Mrs. Johnson",
  "rosterId": "roster_123",
  "assignedUserId": "carer_456"
}
```

2. **Clock In (Create Attendance)**
```http
POST /api/attendance
{
  "shiftId": "shift_789",
  "userId": "carer_456",
  "clockIn": "2025-01-15T09:00:00Z"
}
```

3. **Clock Out (Update Attendance)**
```http
PATCH /api/attendance/att_001
{
  "clockOut": "2025-01-15T17:00:00Z",
  "breakDuration": 0.5
}
```

4. **Manager Approves Attendance**
```http
POST /api/attendance/att_001/approve
```

5. **Generate Payroll from Attendance**
```http
POST /api/payroll/generate
{
  "userId": "carer_456",
  "periodStart": "2025-01-01T00:00:00Z",
  "periodEnd": "2025-01-31T23:59:59Z"
}
```

6. **Manager Approves Payroll**
```http
POST /api/payroll/pay_123/approve
```

7. **Export Payroll to Excel**
```http
GET /api/reports/payroll/export?periodStart=2025-01-01&periodEnd=2025-01-31
```

### Scenario 2: Bulk Employee Import

1. **Prepare Excel File** with columns:
   - firstName, lastName, email, phone, address, hourlyRate, bankAccount, nationalInsuranceNumber

2. **Import Employees**
```http
POST /api/reports/employees/import
Content-Type: multipart/form-data
file: employees.xlsx
```

3. **Verify Import**
```http
GET /api/user
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Not authenticated"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Only admins can delete attendance records"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Attendance record not found"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "error": "Attendance record already exists for this shift"
}
```

---

## Postman Collection

Create a Postman collection with these endpoints for easier testing:

### Environment Variables:
```
base_url = http://localhost:5001
access_token = [Set after login]
user_id = [Set after login]
company_id = [Set after login]
```

### Collection Structure:
- 📁 Auth
  - POST Login
  - POST Register
  - GET Me
- 📁 Attendance
  - POST Create
  - GET List
  - GET Single
  - PATCH Update
  - POST Approve
  - DELETE Delete
- 📁 Payroll
  - POST Create
  - POST Generate
  - GET List
  - GET Single
  - PATCH Update
  - POST Approve
  - DELETE Delete
- 📁 Reports
  - GET Export Employees
  - POST Import Employees
  - GET Export Payroll
  - GET Export Attendance
  - POST Import Shifts

---

## Tips

1. **Always authenticate first** and copy the access token
2. **Test in order**: Create → Read → Update → Delete
3. **Use valid IDs** from previous responses
4. **Check role permissions** - some endpoints require ADMIN or MANAGER roles
5. **Test error cases** - try invalid IDs, unauthorized access, etc.
6. **Verify calculations** - Check that payroll calculations are correct
7. **Test Excel exports** - Open the files to verify format

---

## Common Issues

### Issue: "Attendance record already exists for this shift"
**Solution:** Each shift can only have one attendance record. Use PATCH to update instead.

### Issue: "Only managers and admins can approve attendance"
**Solution:** Login as a user with MANAGER or ADMIN role.

### Issue: "Failed to generate payroll"
**Solution:** Ensure there are approved attendance records for the specified period.

### Issue: Excel import fails
**Solution:** Verify Excel file format matches expected columns exactly.

---

For more details, see:
- `README.md` - Full API documentation
- `MIGRATION_GUIDE.md` - Schema details
- `REFACTORING_SUMMARY.md` - Complete feature list

