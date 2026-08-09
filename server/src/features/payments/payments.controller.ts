import { Response } from "express";
import { PaymentStatus } from "@prisma/client";
import {
createPaymentService,
getPaymentsService,
updatePaymentStatusService,
deletePaymentService,
} from "./payments.service";
import { AuthRequest } from "../../shared/middleware/auth.middleware";

export const createPayment = async (
req: AuthRequest,
res: Response
) => {
if (!req.user) {
return res.status(401).json({
success: false,
message: "Unauthorized",
});
}

const result = await createPaymentService(
{
month: Number(req.body.month),
year: Number(req.body.year),
amount: Number(req.body.amount),
studentId: req.body.studentId as string,
status: req.body.status as PaymentStatus | undefined,
},
req.user.id
);

if (!result.success) {
return res.status(400).json(result);
}

return res.status(201).json(result);
};

export const getPayments = async (
req: AuthRequest,
res: Response
) => {
if (!req.user) {
return res.status(401).json({
success: false,
message: "Unauthorized",
});
}

const classId = req.query.classId as string | undefined;
const groupId = req.query.groupId as string | undefined;
const month = req.query.month
? Number(req.query.month)
: undefined;
const year = req.query.year
? Number(req.query.year)
: undefined;

const result = await getPaymentsService(
{
classId,
groupId,
month: Number.isNaN(month) ? undefined : month,
year: Number.isNaN(year) ? undefined : year,
},
req.user.id
);

return res.status(200).json(result);
};

export const updatePaymentStatus = async (
req: AuthRequest,
res: Response
) => {
if (!req.user) {
return res.status(401).json({
success: false,
message: "Unauthorized",
});
}

const result = await updatePaymentStatusService(
req.params.id as string,
req.body.status as PaymentStatus,
req.user.id
);

if (!result.success) {
return res.status(404).json(result);
}

return res.status(200).json(result);
};

export const deletePayment = async (
req: AuthRequest,
res: Response
) => {
if (!req.user) {
return res.status(401).json({
success: false,
message: "Unauthorized",
});
}

const result = await deletePaymentService(
req.params.id as string,
req.user.id
);

if (!result.success) {
return res.status(404).json(result);
}

return res.status(200).json(result);
};
