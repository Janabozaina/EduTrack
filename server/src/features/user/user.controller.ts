import type { Response } from "express";
import { AuthRequest } from "../../shared/middleware/auth.middleware";
import {
  changeUserPasswordService,
  getUserProfileService,
  updateUserProfileService,
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
