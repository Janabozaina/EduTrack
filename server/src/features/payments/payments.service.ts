import prisma from "../../shared/lib/prisma";
import { PaymentStatus } from "@prisma/client";

interface PaymentData {
month: number;
year: number;
amount: number;
studentId: string;
status?: PaymentStatus;
}

export const createPaymentService = async (
data: PaymentData,
userId: string
) => {
const student = await prisma.student.findFirst({
where: {
id: data.studentId,
class: {
userId,
},
},
});

if (!student) {
return {
success: false,
message: "Student not found.",
};
}

const exists = await prisma.payment.findFirst({
where: {
studentId: data.studentId,
month: data.month,
year: data.year,
student: {
class: {
userId,
},
},
},
});

if (exists) {
return {
success: false,
message: "Payment already exists for this month.",
};
}

const payment = await prisma.payment.create({
data: {
month: data.month,
year: data.year,
amount: data.amount,
studentId: data.studentId,
status: data.status ?? PaymentStatus.PENDING,
paidAt:
data.status === PaymentStatus.PAID
? new Date()
: null,
},
});

return {
success: true,
message: "Payment created successfully.",
data: payment,
};
};

interface PaymentFilters {
classId?: string;
groupId?: string;
month?: number;
year?: number;
}

export const getPaymentsService = async (
filters: PaymentFilters | undefined,
userId: string
) => {
const where: any = {
student: {
class: {
userId,
},
},
};

if (filters?.month) {
where.month = filters.month;
}

if (filters?.year) {
where.year = filters.year;
}

if (filters?.classId) {
where.student.classId = filters.classId;
}

if (filters?.groupId) {
where.student.groupId = filters.groupId;
}

const payments = await prisma.payment.findMany({
where,
include: {
student: {
include: {
class: true,
group: true,
},
},
},
orderBy: {
createdAt: "desc",
},
});

return {
success: true,
data: payments,
};
};

export const updatePaymentStatusService = async (
id: string,
status: PaymentStatus,
userId: string
) => {
const payment = await prisma.payment.findFirst({
where: {
id,
student: {
class: {
userId,
},
},
},
});

if (!payment) {
return {
success: false,
message: "Payment not found.",
};
}

const updated = await prisma.payment.update({
where: {
id,
},
data: {
status,
paidAt:
status === PaymentStatus.PAID
? new Date()
: null,
},
});

return {
success: true,
message: "Payment updated successfully.",
data: updated,
};
};

export const deletePaymentService = async (
id: string,
userId: string
) => {
const payment = await prisma.payment.findFirst({
where: {
id,
student: {
class: {
userId,
},
},
},
});

if (!payment) {
return {
success: false,
message: "Payment not found.",
};
}

await prisma.payment.delete({
where: {
id,
},
});

return {
success: true,
message: "Payment deleted successfully.",
};
};
