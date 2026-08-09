import prisma from "../../shared/lib/prisma";

export const dashboardStatisticsService = async () => {
  const totalStudents = await prisma.student.count();

  const activeStudents = await prisma.student.count({
    where: {
      isActive: true,
    },
  });

  const totalClasses = await prisma.class.count();

  const totalGroups = await prisma.group.count();

  const totalPayments = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
  });

  const paidPayments = await prisma.payment.count({
    where: {
      status: "PAID",
    },
  });

  const pendingPayments = await prisma.payment.count({
    where: {
      status: "PENDING",
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayAttendance = await prisma.attendance.count({
    where: {
      date: {
        gte: today,
      },
    },
  });

  return {
    success: true,
    data: {
      totalStudents,
      activeStudents,
      totalClasses,
      totalGroups,
      todayAttendance,
      paidPayments,
      pendingPayments,
      totalIncome: totalPayments._sum.amount ?? 0,
    },
  };
};