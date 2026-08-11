import { Response } from "express";

import {
  startAttendanceService,
  stopAttendanceService,
  getCurrentSessionService,
  studentScanAttendanceService,
  getAttendanceService,
  saveAttendanceService,
} from "./attendance.service";

import { AuthRequest } from "../../shared/middleware/auth.middleware";

// ===============================
// Start Attendance Session
// ===============================
export const startAttendance = async (
  req: AuthRequest,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const result = await startAttendanceService(req.user.id);

  return res.status(200).json(result);
};

// ===============================
// Stop Attendance Session
// ===============================
export const stopAttendance = async (
  req: AuthRequest,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const result = await stopAttendanceService(req.user.id);

  return res.status(200).json(result);
};

// ===============================
// Get Current Session
// ===============================
export const getCurrentSession = async (
  req: AuthRequest,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const result = await getCurrentSessionService(req.user.id);

  if (!result.success) {
    return res.status(404).json(result);
  }

  return res.status(200).json(result);
};

// ===============================
// PUBLIC - Student Scans QR
// ===============================
export const scanAttendance = async (
  req: any,
  res: Response
) => {
  try {
    const token = req.body.token as string;
    const deviceToken = req.body.deviceToken as string;

    if (!token || !deviceToken) {
      return res.status(400).json({
        success: false,
        message: "token and deviceToken are required.",
      });
    }

    const result = await studentScanAttendanceService(
      token,
      deviceToken
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Scan Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to record attendance.",
    });
  }
};

// ===============================
// Get Attendance
// ===============================
export const getAttendance = async (
  req: AuthRequest,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const groupId = req.query.groupId as string | undefined;
  const date = req.query.date as string | undefined;

  if (!groupId) {
    return res.status(400).json({
      success: false,
      message: "groupId is required",
    });
  }

  const result = await getAttendanceService(
    groupId,
    date,
    req.user.id
  );

  return res.status(200).json(result);
};

// ===============================
// Save Manual Attendance
// ===============================
export const saveAttendance = async (
  req: AuthRequest,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const groupId = req.body.groupId as string;
  const date = req.body.date as string;

  const records = req.body.records as Array<{
    studentId: string;
    status: "PRESENT" | "ABSENT";
  }>;

  if (!groupId || !date || !Array.isArray(records)) {
    return res.status(400).json({
      success: false,
      message: "groupId, date and records are required",
    });
  }

  const result = await saveAttendanceService(
    groupId,
    date,
    records,
    req.user.id
  );

  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.status(200).json(result);
};