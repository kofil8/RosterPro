import { Router } from "express";
import multer from "multer";
import { authenticate, authorize } from "../middleware/auth";
import {
  exportEmployees,
  importEmployees,
  exportPayroll,
  exportAttendance,
  importShifts,
} from "../controllers/reports.controller";
import { UserRole } from "@prisma/client";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// All routes require authentication
router.use(authenticate);

// Export employees - Admin/Manager/Accountant
router.get(
  "/employees/export",
  authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.ACCOUNTANT),
  exportEmployees
);

// Import employees - Admin only
router.post(
  "/employees/import",
  authorize(["ADMIN"]),
  upload.single("file"),
  importEmployees
);

// Export payroll - Admin/Manager/Accountant
router.get(
  "/payroll/export",
  authorize(["ADMIN", "MANAGER", "ACCOUNTANT"]),
  exportPayroll
);

// Export attendance - Admin/Manager/Accountant
router.get(
  "/attendance/export",
  authorize(["ADMIN", "MANAGER", "ACCOUNTANT"]),
  exportAttendance
);

// Import shifts - Admin/Manager
router.post(
  "/shifts/import",
  authorize(["ADMIN", "MANAGER"]),
  upload.single("file"),
  importShifts
);

export default router;
