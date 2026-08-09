import { Request, Response } from "express";
import {
  createGroupService,
  deleteGroupService,
  getGroupsService,
  updateGroupService,
} from "./groups.service";

export const createGroup = async (req: Request, res: Response) => {
  const result = await createGroupService(
    req.body.name as string,
    req.body.classId as string,
    req.body.day as string | undefined,
    req.body.startTime as string | undefined,
    req.body.room as string | undefined
  );

  return res.status(201).json(result);
};

export const getGroups = async (req: Request, res: Response) => {
  const classId = req.query.classId as string | undefined;
  const groups = await getGroupsService(classId);

  return res.status(200).json({ success: true, data: groups });
};

export const updateGroup = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const group = await updateGroupService(
    id,
    req.body.name as string,
    req.body.day as string | undefined,
    req.body.startTime as string | undefined,
    req.body.room as string | undefined
  );

  return res.status(200).json(group);
};

export const deleteGroup = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  await deleteGroupService(id);

  return res.status(200).json({
    success: true,
    message: "Group deleted successfully.",
  });
};
