import { Router } from "express";
import { authenticate } from "../../shared/middleware/auth.middleware";
import {
  createStudent,
  getStudents,
  getStudentAttendance,
  updateStudent,
  deleteStudent,
} from "./students.controller";

const router = Router();

router.post("/", createStudent);

router.get("/", getStudents);

router.get("/:id/attendance", getStudentAttendance);

router.put("/:id", updateStudent);

router.delete("/:id", deleteStudent);

export default router;