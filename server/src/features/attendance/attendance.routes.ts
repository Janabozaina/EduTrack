import { Router } from "express";
import {
  startAttendance,
  stopAttendance,
  getCurrentSession,
  scanAttendance,
  getAttendance,
  saveAttendance,
} from "./attendance.controller";

const router = Router();

router.post("/start", startAttendance);

router.post("/stop", stopAttendance);

router.get("/current", getCurrentSession);

router.post("/scan", scanAttendance);

// Get attendance for a group and date
router.get("/", getAttendance);

// Save attendance records for a group and date
router.post("/", saveAttendance);

export default router;