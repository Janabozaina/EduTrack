import type { Response } from "express";
import { getNotificationsService } from "./notifications.service";
import { AuthRequest } from "../../shared/middleware/auth.middleware";

export const getNotifications = async (
  req: AuthRequest,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const result = await getNotificationsService(req.user.id);

  return res.status(200).json(result);
};

