import { Request, Response } from "express";
import { PaymentStatus } from "@prisma/client";
import {
  createPaymentService,
  getPaymentsService,
  updatePaymentStatusService,
  deletePaymentService,
} from "./payments.service";

export const createPayment = async (
  req: Request,
  res: Response
) => {
  const result = await createPaymentService({
    month: Number(req.body.month),
    year: Number(req.body.year),
    amount: Number(req.body.amount),
    studentId: req.body.studentId as string,
    status: req.body.status as PaymentStatus | undefined,
  });

  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.status(201).json(result);
};

export const getPayments = async (
  req: Request,
  res: Response
) => {
  const classId = req.query.classId as string | undefined;
  const groupId = req.query.groupId as string | undefined;
  const month = req.query.month ? Number(req.query.month) : undefined;
  const year = req.query.year ? Number(req.query.year) : undefined;

  const result = await getPaymentsService({
    classId,
    groupId,
    month: Number.isNaN(month) ? undefined : month,
    year: Number.isNaN(year) ? undefined : year,
  });

  return res.status(200).json(result);
};

export const updatePaymentStatus = async (
  req: Request,
  res: Response
) => {
  const result = await updatePaymentStatusService(
    req.params.id as string,
    req.body.status as PaymentStatus
  );

  if (!result.success) {
    return res.status(404).json(result);
  }

  return res.status(200).json(result);
};

export const deletePayment = async (
  req: Request,
  res: Response
) => {
  const result = await deletePaymentService(
    req.params.id as string
  );

  if (!result.success) {
    return res.status(404).json(result);
  }

  return res.status(200).json(result);
};