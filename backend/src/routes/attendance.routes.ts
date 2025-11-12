import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  createAttendance,
  getAttendances,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
  approveAttendance,
} from "../controllers/attendance.controller";
import { UserRole } from "@prisma/client";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create attendance (clock-in) - All authenticated users
router.post("/", createAttendance);

// Get all attendance records - Role-based access
router.get("/", getAttendances);

// Get single attendance record
router.get("/:id", getAttendanceById);

// Update attendance (clock-out, edit) - Owner or Admin/Manager
router.patch("/:id", updateAttendance);

// Delete attendance - Admin only
router.delete("/:id", authorize(UserRole.ADMIN), deleteAttendance);

// Approve attendance - Manager/Admin only
router.post(
  "/:id/approve",
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  approveAttendance
);

export default router;
