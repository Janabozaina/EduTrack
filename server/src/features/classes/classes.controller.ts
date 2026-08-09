import { Request, Response } from "express";
import {
  createClassService,
  deleteClassService,
  getClassesService,
  updateClassService,
} from "./classes.service";

export const createClass = async (req: Request, res: Response) => {
  const title = req.body.title as string;

  const result = await createClassService(title);

  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.status(201).json(result);
};

export const getClasses = async (_req: Request, res: Response) => {
  const result = await getClassesService();
  return res.status(200).json(result);
};

export const updateClass = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const title = req.body.title as string;

  const result = await updateClassService(id, title);

  if (!result.success) {
    return res.status(404).json(result);
  }

  return res.status(200).json(result);
};

export const deleteClass = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const result = await deleteClassService(id);

  if (!result.success) {
    return res.status(404).json(result);
  }

  return res.status(200).json(result);
};