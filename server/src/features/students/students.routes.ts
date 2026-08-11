import { Router } from "express";

import {
  createStudent,
  registerStudent,
  getRegistrationClasses,
  getStudents,
  getStudentAttendance,
  updateStudent,
  deleteStudent,
} from "./students.controller";

const router = Router();

/*
 * PUBLIC STUDENT REGISTRATION
 *
 * No login required.
 */
router.post("/register", registerStudent);

router.get("/registration-classes", getRegistrationClasses);

/*
 * EXISTING ADMIN ROUTES
 */
router.post("/", createStudent);

router.get("/", getStudents);

router.get("/:id/attendance", getStudentAttendance);

router.put("/:id", updateStudent);

router.delete("/:id", deleteStudent);

export default router;