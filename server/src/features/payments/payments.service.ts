import prisma from "../../shared/lib/prisma";
import { PaymentStatus } from "@prisma/client";

interface PaymentData {
  month: number;
  year: number;
  amount: number;
  studentId: string;
  status?: PaymentStatus;
}

export const createPaymentService = async (data: PaymentData) => {
  const student = await prisma.student.findUnique({
    where: {
      id: data.studentId,
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
        data.status === PaymentStatus.PAID ? new Date() : null,
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

export const getPaymentsService = async (filters?: PaymentFilters) => {
  const where: any = {};

  if (filters?.month) {
    where.month = filters.month;
  }

  if (filters?.year) {
    where.year = filters.year;
  }

  if (filters?.classId || filters?.groupId) {
    where.student = {};

    if (filters.classId) {
      where.student.classId = filters.classId;
    }

    if (filters.groupId) {
      where.student.groupId = filters.groupId;
    }
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
  status: PaymentStatus
) => {
  const payment = await prisma.payment.findUnique({
    where: {
      id,
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
        status === PaymentStatus.PAID ? new Date() : null,
    },
  });

  return {
    success: true,
    message: "Payment updated successfully.",
    data: updated,
  };
};

export const deletePaymentService = async (id: string) => {
  const payment = await prisma.payment.findUnique({
    where: {
      id,
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