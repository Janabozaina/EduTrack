import prisma from "../../shared/lib/prisma";

export const dashboardStatisticsService = async (
userId: string
) => {
const totalStudents = await prisma.student.count({
where: {
class: {
userId,
},
},
});

const activeStudents = await prisma.student.count({
where: {
isActive: true,
class: {
userId,
},
},
});

const totalClasses = await prisma.class.count({
where: {
userId,
},
});

const totalGroups = await prisma.group.count({
where: {
class: {
userId,
},
},
});

const totalPayments = await prisma.payment.aggregate({
where: {
student: {
class: {
userId,
},
},
},
_sum: {
amount: true,
},
});

const paidPayments = await prisma.payment.count({
where: {
status: "PAID",
student: {
class: {
userId,
},
},
},
});

const pendingPayments = await prisma.payment.count({
where: {
status: "PENDING",
student: {
class: {
userId,
},
},
},
});

const today = new Date();
today.setHours(0, 0, 0, 0);

const todayAttendance = await prisma.attendance.count({
where: {
date: {
gte: today,
},
student: {
class: {
userId,
},
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
