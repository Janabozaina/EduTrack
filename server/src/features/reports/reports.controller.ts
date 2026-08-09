import { Request, Response } from "express";
import { dashboardStatisticsService } from "./reports.service";

export const dashboardStatistics = async (
  _req: Request,
  res: Response
) => {
  const result = await dashboardStatisticsService();

  return res.status(200).json(result);
};