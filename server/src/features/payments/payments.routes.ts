import { Router } from "express";
import {
  createPayment,
  getPayments,
  updatePaymentStatus,
  deletePayment,
} from "./payments.controller";

const router = Router();

router.post("/", createPayment);

router.get("/", getPayments);

router.patch("/:id", updatePaymentStatus);

router.delete("/:id", deletePayment);

export default router;