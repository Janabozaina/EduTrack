import type { Response } from "express";
import { AuthRequest } from "../../shared/middleware/auth.middleware";
import {
   changeUserPasswordService,
  getUserProfileService,
  updateUserProfileService,
   getAllUsersService,
   createUserService,
   updateUserByAdminService,
   deleteUserByAdminService,
} from "./user.service";

export const getProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const user = await getUserProfileService(userId);

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  return res.status(200).json({ success: true, data: { user } });
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const result = await updateUserProfileService(userId, {
    name: req.body.name as string,
    email: req.body.email as string,
  });

  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.status(200).json({
    success: true,
    message: result.message,
    data: { user: result.user },
  });
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const result = await changeUserPasswordService(userId, {
    currentPassword: req.body.currentPassword as string,
    newPassword: req.body.newPassword as string,
  });

  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.status(200).json({ success: true, message: result.message });
};

export const getAllUsers = async (
  req: AuthRequest,
  res: Response
) => {
  const result = await getAllUsersService();

  return res.status(200).json(result);
};


export const createUserByAdmin = async (
  req: AuthRequest,
  res: Response
) => {
  const result = await createUserService(
    req.body.name as string,
    req.body.email as string,
    req.body.password as string,
    req.body.role as "ADMIN" | "TEACHER"
  );

  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.status(201).json(result);
};


export const updateUserByAdmin = async (
  req: AuthRequest,
  res: Response
) => {
  const id = req.params.id as string;

  const result = await updateUserByAdminService(id, {
    name: req.body.name as string,
    email: req.body.email as string,
    role: req.body.role as "ADMIN" | "TEACHER",
  });

  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.status(200).json(result);
};


export const deleteUserByAdmin = async (
  req: AuthRequest,
  res: Response
) => {
  const id = req.params.id as string;

  const result = await deleteUserByAdminService(id);

  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.status(200).json(result);
};