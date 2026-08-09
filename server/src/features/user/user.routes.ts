import { Router } from "express";
import { changePassword, getProfile, updateProfile } from "./user.controller";

const router = Router();

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/password", changePassword);

export default router;
