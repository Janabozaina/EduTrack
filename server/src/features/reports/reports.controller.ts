import { Response } from "express";
import { dashboardStatisticsService } from "./reports.service";
import { AuthRequest } from "../../shared/middleware/auth.middleware";

export const dashboardStatistics = async (
  req: AuthRequest,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const result = await dashboardStatisticsService(req.user.id);

  return res.status(200).json(result);
};

