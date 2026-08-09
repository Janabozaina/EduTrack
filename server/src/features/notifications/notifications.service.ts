import prisma from "../../shared/lib/prisma";

export type NotificationType =
  | "payment-reminder"
  | "payment-success"
  | "attendance-absence";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: Date;
  studentId: string;
  studentName: string;
  studentCode: string;
  className?: string;
  groupName?: string;
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const getNotificationsService = async () => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);

  const pendingPayments = await prisma.payment.findMany({
    where: {
      status: "PENDING",
      month: currentMonth,
      year: currentYear,
    },
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
    take: 10,
  });

  const recentPaidPayments = await prisma.payment.findMany({
    where: {
      status: "PAID",
      paidAt: {
        gte: weekAgo,
      },
    },
    include: {
      student: {
        include: {
          class: true,
          group: true,
        },
      },
    },
    orderBy: {
      paidAt: "desc",
    },
    take: 8,
  });

  const recentAbsences = await prisma.attendance.findMany({
    where: {
      status: "ABSENT",
      date: {
        gte: weekAgo,
      },
    },
    include: {
      student: {
        include: {
          class: true,
          group: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
    take: 8,
  });

  const notifications: NotificationItem[] = [];

  for (const payment of pendingPayments) {
    notifications.push({
      id: `payment-reminder-${payment.id}`,
      type: "payment-reminder",
      title: "Payment reminder",
      description: `${payment.student.name} has a pending payment for ${monthNames[payment.month - 1]} ${payment.year}.`,
      createdAt: payment.createdAt,
      studentId: payment.student.id,
      studentName: payment.student.name,
      studentCode: payment.student.studentCode,
      className: payment.student.class?.title ?? undefined,
      groupName: payment.student.group?.name ?? undefined,
    });
  }

  for (const payment of recentPaidPayments) {
    notifications.push({
      id: `payment-success-${payment.id}`,
      type: "payment-success",
      title: "Payment received",
      description: `${payment.student.name} paid ${payment.amount.toLocaleString()} EGP for ${monthNames[payment.month - 1]} ${payment.year}.`,
      createdAt: payment.paidAt ?? payment.createdAt,
      studentId: payment.student.id,
      studentName: payment.student.name,
      studentCode: payment.student.studentCode,
      className: payment.student.class?.title ?? undefined,
      groupName: payment.student.group?.name ?? undefined,
    });
  }

  for (const attendance of recentAbsences) {
    notifications.push({
      id: `attendance-absence-${attendance.id}`,
      type: "attendance-absence",
      title: "Student absent",
      description: `${attendance.student.name} was marked absent on ${attendance.date.toISOString().slice(0, 10)}.`,
      createdAt: attendance.date,
      studentId: attendance.student.id,
      studentName: attendance.student.name,
      studentCode: attendance.student.studentCode,
      className: attendance.student.class?.title ?? undefined,
      groupName: attendance.student.group?.name ?? undefined,
    });
  }

  notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return {
    success: true,
    data: notifications,
  };
};
