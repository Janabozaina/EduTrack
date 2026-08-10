import { Router } from "express";
import {
  changePassword,
  createUserByAdmin,
  deleteUserByAdmin,
  getAllUsers,
  getProfile,
  updateProfile,
  updateUserByAdmin,
} from "./user.controller";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { requireAdmin } from "../../shared/middleware/admin.middleware";

const router = Router();

// Current user
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.put("/password", authenticate, changePassword);

// Admin user management
router.get(
  "/admin/users",
  authenticate,
  requireAdmin,
  getAllUsers
);

router.post(
  "/admin/users",
  authenticate,
  requireAdmin,
  createUserByAdmin
);

router.put(
  "/admin/users/:id",
  authenticate,
  requireAdmin,
  updateUserByAdmin
);

router.delete(
  "/admin/users/:id",
  authenticate,
  requireAdmin,
  deleteUserByAdmin
);

export default router;