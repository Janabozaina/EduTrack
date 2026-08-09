import { Router } from "express";
import {
  createGroup,
  deleteGroup,
  getGroups,
  updateGroup,
} from "./groups.controller";

const router = Router();

router.post("/", createGroup);

router.get("/", getGroups);

router.put("/:id", updateGroup);

router.delete("/:id", deleteGroup);

export default router;