import { Request, Response } from "express";
import {
  startAttendanceService,
  stopAttendanceService,
  getCurrentSessionService,
  scanAttendanceService,
  getAttendanceService,
  saveAttendanceService,
} from "./attendance.service";

export const startAttendance = async (
  _req: Request,
  res: Response
) => {
  const result = await startAttendanceService();

  return res.status(200).json(result);
};

export const stopAttendance = async (
  _req: Request,
  res: Response
) => {
  const result = await stopAttendanceService();

  return res.status(200).json(result);
};

export const getCurrentSession = async (
  _req: Request,
  res: Response
) => {
  const result = await getCurrentSessionService();

  if (!result.success) {
    return res.status(404).json(result);
  }

  return res.status(200).json(result);
};

export const scanAttendance = async (
  req: Request,
  res: Response
) => {
  const result = await scanAttendanceService(
    req.body.token as string,
    req.body.studentId as string
  );

  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.status(200).json(result);
};

// GET /api/attendance?groupId=...&date=YYYY-MM-DD
export const getAttendance = async (req: Request, res: Response) => {
  const groupId = req.query.groupId as string | undefined;
  const date = req.query.date as string | undefined;

  if (!groupId) {
    return res.status(400).json({ success: false, message: "groupId is required" });
  }

  const result = await getAttendanceService(groupId, date);

  return res.status(200).json(result);
};

// POST /api/attendance
// body: { groupId, date, records: [{ studentId, status }] }
export const saveAttendance = async (req: Request, res: Response) => {
  const groupId = req.body.groupId as string;
  const date = req.body.date as string;
  const records = req.body.records as Array<{ studentId: string; status: "PRESENT" | "ABSENT" }>;

  if (!groupId || !date || !Array.isArray(records)) {
    return res.status(400).json({ success: false, message: "groupId, date and records are required" });
  }

  const result = await saveAttendanceService(groupId, date, records);

  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.status(200).json(result);
};
