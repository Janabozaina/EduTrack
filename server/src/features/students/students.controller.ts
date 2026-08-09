import { Request, Response } from "express";
import {
  createStudentService,
  getStudentsService,
  updateStudentService,
  deleteStudentService,
} from "./students.service";

export const createStudent = async (req: Request, res: Response) => {
  const result = await createStudentService({
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
  });

  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.status(201).json(result);
};

export const getStudents = async (req: Request, res: Response) => {
  const result = await getStudentsService(
    req.query.search as string,
    req.query.classId as string,
    req.query.groupId as string,
    Number(req.query.page) || 1,
    Number(req.query.limit) || 10
  );

  return res.status(200).json(result);
};

export const updateStudent = async (req: Request, res: Response) => {
  const result = await updateStudentService(req.params.id as string, {
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
  });

  if (!result.success) {
    return res.status(404).json(result);
  }

  return res.status(200).json(result);
};

export const deleteStudent = async (req: Request, res: Response) => {
  const result = await deleteStudentService(req.params.id as string);

  if (!result.success) {
    return res.status(404).json(result);
  }

  return res.status(200).json(result);
};