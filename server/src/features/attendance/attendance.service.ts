import prisma from "../../shared/lib/prisma";
import crypto from "crypto";
import QRCode from "qrcode";

export const startAttendanceService = async () => {
  await prisma.attendanceSession.updateMany({
    where: {
      isActive: true,
    },
    data: {
      isActive: false,
    },
  });

  const token = crypto.randomUUID();

  const expiresAt = new Date(Date.now() + 1000 * 10);

  const session = await prisma.attendanceSession.create({
    data: {
      token,
      expiresAt,
    },
  });

  const qr = await QRCode.toDataURL(token);

  return {
    success: true,
    message: "Attendance started.",
    data: {
      ...session,
      qr,
    },
  };
};

export const stopAttendanceService = async () => {
  await prisma.attendanceSession.updateMany({
    where: {
      isActive: true,
    },
    data: {
      isActive: false,
    },
  });

  return {
    success: true,
    message: "Attendance stopped.",
  };
};

export const getCurrentSessionService = async () => {
  const session = await prisma.attendanceSession.findFirst({
    where: {
      isActive: true,
    },
  });

  if (!session) {
    return {
      success: false,
      message: "No active attendance session.",
    };
  }

  const qr = await QRCode.toDataURL(session.token);

  return {
    success: true,
    data: {
      ...session,
      qr,
    },
  };
};

export const scanAttendanceService = async (
  token: string,
  studentId: string
) => {
  const session = await prisma.attendanceSession.findUnique({
    where: {
      token,
    },
  });

  if (!session || !session.isActive || session.expiresAt < new Date()) {
    return {
      success: false,
      message: "QR expired or invalid.",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const exists = await prisma.attendance.findFirst({
    where: {
      studentId,
      date: {
        gte: today,
      },
    },
  });

  if (exists) {
    return {
      success: false,
      message: "Student already attended today.",
    };
  }

  const attendance = await prisma.attendance.create({
    data: {
      studentId,
      date: new Date(),
      status: "PRESENT",
      method: "QR",
    },
  });

  return {
    success: true,
    message: "Attendance recorded.",
    data: attendance,
  };
};

// Get attendance for a group and optional date (YYYY-MM-DD). Returns students in group with attendance for that date (if any).
export const getAttendanceService = async (groupId: string, dateStr?: string) => {
  const date = dateStr ? new Date(dateStr) : new Date();
  date.setHours(0, 0, 0, 0);
  const next = new Date(date);
  next.setDate(next.getDate() + 1);

  // fetch students in group and include attendance for the provided date
  const students = await prisma.student.findMany({
    where: { groupId },
    include: {
      class: true,
      group: true,
      attendances: {
        where: {
          date: {
            gte: date,
            lt: next,
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // normalize to attach single attendance record or null
  const data = students.map((s) => ({
    id: s.id,
    name: s.name,
    studentCode: s.studentCode,
    phone: s.phone,
    parentPhone: s.parentPhone,
    monthlyFee: s.monthlyFee,
    isActive: s.isActive,
    class: s.class,
    group: s.group,
    attendance: s.attendances && s.attendances.length ? s.attendances[0] : null,
  }));

  return {
    success: true,
    data,
  };
};

// Save attendance records for a group/date. Records is array of { studentId, status }
export const saveAttendanceService = async (
  groupId: string,
  dateStr: string,
  records: Array<{ studentId: string; status: "PRESENT" | "ABSENT" }>
) => {
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  const next = new Date(date);
  next.setDate(next.getDate() + 1);

  // Ensure group exists
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) {
    return { success: false, message: "Group not found." };
  }

  // Process each record: upsert attendance for that student on that date
  for (const r of records) {
    const exists = await prisma.attendance.findFirst({
      where: {
        studentId: r.studentId,
        date: {
          gte: date,
          lt: next,
        },
      },
    });

    if (exists) {
      await prisma.attendance.update({
        where: { id: exists.id },
        data: {
          status: r.status,
          method: "MANUAL",
        },
      });
    } else {
      await prisma.attendance.create({
        data: {
          studentId: r.studentId,
          date: date,
          status: r.status,
          method: "MANUAL",
        },
      });
    }
  }

  return { success: true, message: "Attendance saved." };
};