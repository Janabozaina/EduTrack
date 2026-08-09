import { Router } from "express";
import { getNotifications } from "./notifications.controller";

const router = Router();

router.get("/", getNotifications);

export default router;
