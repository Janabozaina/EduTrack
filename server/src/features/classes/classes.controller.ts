import { Response } from "express";
import { AuthRequest } from "../../shared/middleware/auth.middleware";

import {
  createClassService,
  deleteClassService,
  getClassesService,
  updateClassService,
} from "./classes.service";

export const createClass = async (req: AuthRequest, res: Response) => {
  const title = req.body.title as string;
  const userId = req.user!.id;

  const result = await createClassService(title, userId);

  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.status(201).json(result);
};

export const getClasses = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const result = await getClassesService(userId);

  return res.status(200).json(result);
};

export const updateClass = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const title = req.body.title as string;
  const userId = req.user!.id;

  const result = await updateClassService(id, title, userId);

  if (!result.success) {
    return res.status(404).json(result);
  }

  return res.status(200).json(result);
};

export const deleteClass = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.id;

  const result = await deleteClassService(id, userId);

  if (!result.success) {
    return res.status(404).json(result);
  }

  return res.status(200).json(result);
};

