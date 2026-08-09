import express from "express";
import cors from "cors";
import groupsRoutes from "./features/groups/groups.routes";
import authRoutes from "./features/auth/auth.routes";
import classesRoutes from "./features/classes/classes.routes";
import studentsRoutes from "./features/students/students.routes";
import attendanceRoutes from "./features/attendance/attendance.routes";
import paymentsRoutes from "./features/payments/payments.routes";
import reportsRoutes from "./features/reports/reports.routes";
import notificationsRoutes from "./features/notifications/notifications.routes";
import userRoutes from "./features/user/user.routes";
import { authenticate } from "./shared/middleware/auth.middleware";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "EduTrack API 🚀",
  });
});
app.use("/api/auth", authRoutes);

app.use("/api/user", authenticate, userRoutes);

app.use("/api/classes", authenticate, classesRoutes);

app.use("/api/groups", authenticate, groupsRoutes);

app.use("/api/students", authenticate, studentsRoutes);

app.use("/api/attendance", authenticate, attendanceRoutes);

app.use("/api/payments", authenticate, paymentsRoutes);

app.use("/api/notifications", authenticate, notificationsRoutes);

app.use("/api/reports", authenticate, reportsRoutes);

export default app;