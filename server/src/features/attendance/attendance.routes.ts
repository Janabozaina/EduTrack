import { Router } from "express";

import {
  startAttendance,
  stopAttendance,
  getCurrentSession,
  scanAttendance,
  getAttendance,
  saveAttendance,
} from "./attendance.controller";

import { authenticate } from "../../shared/middleware/auth.middleware";

const router = Router();

// Teacher routes
router.post("/start", authenticate, startAttendance);

router.post("/stop", authenticate, stopAttendance);

router.get("/current", authenticate, getCurrentSession);

// PUBLIC
// Student scans QR without an account/login
router.post("/scan", scanAttendance);

// Teacher attendance history
router.get("/", authenticate, getAttendance);

// Teacher manual attendance
router.post("/", authenticate, saveAttendance);

export default router;