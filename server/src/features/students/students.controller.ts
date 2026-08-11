import { Response } from "express";

import {
  createStudentService,
  registerStudentService,
  getRegistrationClassesService,
  getStudentsService,
  updateStudentService,
  deleteStudentService,
  getStudentAttendanceService,
} from "./students.service";

import { AuthRequest } from "../../shared/middleware/auth.middleware";

/*
 * ADMIN - Create student
 */
export const createStudent = async (
  req: AuthRequest,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const result = await createStudentService(
    {
      name: req.body.name as string,
      phone: req.body.phone,
      parentPhone: req.body.parentPhone,
      address: req.body.address,
      birthDate: req.body.birthDate
        ? new Date(req.body.birthDate)
        : undefined,
      photo: req.body.photo,
      monthlyFee: Number(req.body.monthlyFee),
      classId: req.body.classId as string,
      groupId: req.body.groupId as string,
    },
    req.user.id
  );

  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.status(201).json(result);
};

/*
 * PUBLIC - Student self registration
 */
export const registerStudent = async (
  req: any,
  res: Response
) => {
  try {
    const result = await registerStudentService({
      name: req.body.name,
      phone: req.body.phone,
      parentPhone: req.body.parentPhone,
      classId: req.body.classId,
      groupId: req.body.groupId,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error("Student Registration Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to register student.",
    });
  }
};

/*
 * PUBLIC - Get classes/groups for registration
 */
export const getRegistrationClasses = async (
  _req: any,
  res: Response
) => {
  try {
    const result = await getRegistrationClassesService();

    return res.status(200).json(result);
  } catch (error) {
    console.error("Registration Classes Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load classes.",
    });
  }
};

export const getStudents = async (
  req: AuthRequest,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const result = await getStudentsService(
    req.user.id,
    req.query.search as string,
    req.query.classId as string,
    req.query.groupId as string,
    Number(req.query.page) || 1,
    Number(req.query.limit) || 10
  );

  return res.status(200).json(result);
};

export const getStudentAttendance = async (
  req: AuthRequest,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const result = await getStudentAttendanceService(
    req.params.id as string,
    req.user.id
  );

  if (!result.success) {
    return res.status(404).json(result);
  }

  return res.status(200).json(result);
};

export const updateStudent = async (
  req: AuthRequest,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const result = await updateStudentService(
    req.params.id as string,
    {
      name: req.body.name as string,
      phone: req.body.phone,
      parentPhone: req.body.parentPhone,
      address: req.body.address,
      birthDate: req.body.birthDate
        ? new Date(req.body.birthDate)
        : undefined,
      photo: req.body.photo,
      monthlyFee: Number(req.body.monthlyFee),
      classId: req.body.classId as string,
      groupId: req.body.groupId as string,
      isActive: req.body.isActive,
    },
    req.user.id
  );

  if (!result.success) {
    return res.status(404).json(result);
  }

  return res.status(200).json(result);
};

export const deleteStudent = async (
  req: AuthRequest,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const result = await deleteStudentService(
    req.params.id as string,
    req.user.id
  );

  if (!result.success) {
    return res.status(404).json(result);
  }

  return res.status(200).json(result);
};