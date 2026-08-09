import { Response } from "express";
import {
  createGroupService,
  deleteGroupService,
  getGroupsService,
  updateGroupService,
} from "./groups.service";
import { AuthRequest } from "../../shared/middleware/auth.middleware";

export const createGroup = async (
  req: AuthRequest,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const result = await createGroupService(
    req.body.name as string,
    req.body.classId as string,
    req.user.id,
    req.body.day as string | undefined,
    req.body.startTime as string | undefined,
    req.body.room as string | undefined
  );

  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.status(201).json(result);
};

export const getGroups = async (
  req: AuthRequest,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const classId = req.query.classId as string | undefined;

  const groups = await getGroupsService(
    req.user.id,
    classId
  );

  return res.status(200).json({
    success: true,
    data: groups,
  });
};

export const updateGroup = async (
  req: AuthRequest,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const id = req.params.id as string;

  const result = await updateGroupService(
    id,
    req.body.name as string,
    req.user.id,
    req.body.day as string | undefined,
    req.body.startTime as string | undefined,
    req.body.room as string | undefined
  );

  if (!result.success) {
    return res.status(404).json(result);
  }

  return res.status(200).json(result);
};

export const deleteGroup = async (
  req: AuthRequest,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const id = req.params.id as string;

  const result = await deleteGroupService(
    id,
    req.user.id
  );

  if (!result.success) {
    return res.status(404).json(result);
  }

  return res.status(200).json(result);
};