import prisma from "../../shared/lib/prisma";
import crypto from "crypto";
import QRCode from "qrcode";

// ==========================================
// Start Attendance Session
// ==========================================
export const startAttendanceService = async (userId: string) => {
  // Stop any previous active session
  await prisma.attendanceSession.updateMany({
    where: {
      isActive: true,
    },
    data: {
      isActive: false,
    },
  });

  const token = crypto.randomUUID();

  // QR valid for 10 seconds
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

// ==========================================
// Stop Attendance Session
// ==========================================
export const stopAttendanceService = async (userId: string) => {
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

// ==========================================
// Get Current Attendance Session
// ==========================================
export const getCurrentSessionService = async (userId: string) => {
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

  // Automatically consider expired session inactive
  if (session.expiresAt < new Date()) {
    await prisma.attendanceSession.update({
      where: {
        id: session.id,
      },
      data: {
        isActive: false,
      },
    });

    return {
      success: false,
      message: "Attendance session expired.",
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

// ==========================================
// PUBLIC - Student scans QR
// ==========================================

export const studentScanAttendanceService = async (
  token: string,
  deviceToken: string
) => {
  // ----------------------------------------
  // Check QR session
  // ----------------------------------------
  const session = await prisma.attendanceSession.findUnique({
    where: {
      token,
    },
  });

  if (!session || !session.isActive) {
    return {
      success: false,
      message: "QR expired or invalid.",
    };
  }

  // ----------------------------------------
  // Check expiration
  // ----------------------------------------
  if (session.expiresAt < new Date()) {
    await prisma.attendanceSession.update({
      where: {
        id: session.id,
      },
      data: {
        isActive: false,
      },
    });

    return {
      success: false,
      message: "QR expired or invalid.",
    };
  }

  // ----------------------------------------
  // Find student by device token
  // ----------------------------------------
  const student = await prisma.student.findFirst({
    where: {
      deviceToken,
      isActive: true,
    },
  });

  // ----------------------------------------
  // Student hasn't registered this device yet
  // ----------------------------------------
  if (!student) {
    return {
      success: false,
      message: "Student registration required.",
      needsRegistration: true,
    };
  }

  // ----------------------------------------
  // Prevent duplicate attendance today
  // ----------------------------------------
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const exists = await prisma.attendance.findFirst({
    where: {
      studentId: student.id,
      date: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  if (exists) {
    return {
      success: false,
      message: "Student already attended today.",
      data: exists,
    };
  }

  // ----------------------------------------
  // Create attendance
  // ----------------------------------------
  const attendance = await prisma.attendance.create({
    data: {
      studentId: student.id,
      date: new Date(),
      status: "PRESENT",
      method: "QR",
    },
  });

  return {
    success: true,
    message: `Attendance recorded for ${student.name}.`,
    data: {
      attendance,
      student: {
        id: student.id,
        name: student.name,
        studentCode: student.studentCode,
      },
    },
  };
};

// ==========================================
// Get Attendance For Group / Date
// ==========================================
export const getAttendanceService = async (
  groupId: string,
  dateStr: string | undefined,
  userId: string
) => {
  const group = await prisma.group.findFirst({
    where: {
      id: groupId,
      class: {
        userId,
      },
    },
  });

  if (!group) {
    return {
      success: false,
      message: "Group not found.",
    };
  }

  const date = dateStr ? new Date(dateStr) : new Date();

  date.setHours(0, 0, 0, 0);

  const next = new Date(date);
  next.setDate(next.getDate() + 1);

  const students = await prisma.student.findMany({
    where: {
      groupId,
      class: {
        userId,
      },
    },
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
    orderBy: {
      name: "asc",
    },
  });

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
    attendance:
      s.attendances && s.attendances.length
        ? s.attendances[0]
        : null,
  }));

  return {
    success: true,
    data,
  };
};

// ==========================================
// Save Manual Attendance
// ==========================================
export const saveAttendanceService = async (
  groupId: string,
  dateStr: string,
  records: Array<{
    studentId: string;
    status: "PRESENT" | "ABSENT";
  }>,
  userId: string
) => {
  const group = await prisma.group.findFirst({
    where: {
      id: groupId,
      class: {
        userId,
      },
    },
  });

  if (!group) {
    return {
      success: false,
      message: "Group not found.",
    };
  }

  const date = new Date(dateStr);

  date.setHours(0, 0, 0, 0);

  const next = new Date(date);
  next.setDate(next.getDate() + 1);

  for (const r of records) {
    const student = await prisma.student.findFirst({
      where: {
        id: r.studentId,
        groupId,
        class: {
          userId,
        },
      },
    });

    if (!student) {
      continue;
    }

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
        where: {
          id: exists.id,
        },
        data: {
          status: r.status,
          method: "MANUAL",
        },
      });
    } else {
      await prisma.attendance.create({
        data: {
          studentId: r.studentId,
          date,
          status: r.status,
          method: "MANUAL",
        },
      });
    }
  }

  return {
    success: true,
    message: "Attendance saved.",
  };
};