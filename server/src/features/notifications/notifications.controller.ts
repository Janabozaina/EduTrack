import type { Request, Response } from "express";
import { getNotificationsService } from "./notifications.service";

export const getNotifications = async (_req: Request, res: Response) => {
  const result = await getNotificationsService();
  return res.status(200).json(result);
};
