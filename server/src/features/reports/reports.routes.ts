import { Router } from "express";
import { dashboardStatistics } from "./reports.controller";

const router = Router();

router.get("/dashboard", dashboardStatistics);

export default router;