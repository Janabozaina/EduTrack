import { Router } from "express";
import {
  createClass,
  deleteClass,
  getClasses,
  updateClass,
} from "./classes.controller";

const router = Router();

router.post("/", createClass);

router.get("/", getClasses);

router.put("/:id", updateClass);

router.delete("/:id", deleteClass);

export default router;