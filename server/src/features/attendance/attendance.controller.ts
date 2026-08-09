import { Response } from "express";
import {
startAttendanceService,
stopAttendanceService,
getCurrentSessionService,
scanAttendanceService,
getAttendanceService,
saveAttendanceService,
} from "./attendance.service";
import { AuthRequest } from "../../shared/middleware/auth.middleware";

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

export const scanAttendance = async (
req: AuthRequest,
res: Response
) => {
if (!req.user) {
return res.status(401).json({
success: false,
message: "Unauthorized",
});
}

const result = await scanAttendanceService(
req.body.token as string,
req.body.studentId as string,
req.user.id
);

if (!result.success) {
return res.status(400).json(result);
}

return res.status(200).json(result);
};

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