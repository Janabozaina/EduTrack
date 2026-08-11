import prisma from "../../shared/lib/prisma";
import crypto from "crypto";

function generateStudentCode() {
  return `EDU-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

function generateDeviceToken() {
  return crypto.randomBytes(32).toString("hex");
}

interface StudentData {
  name: string;
  phone?: string;
  parentPhone?: string;
  address?: string;
  birthDate?: Date;
  photo?: string;
  monthlyFee: number;
  classId: string;
  groupId: string;
  isActive?: boolean;
}

/*
 * Admin creates a student
 */
export const createStudentService = async (
  data: StudentData,
  userId: string
) => {
  const classExists = await prisma.class.findFirst({
    where: {
      id: data.classId,
      userId,
    },
  });

  if (!classExists) {
    return {
      success: false,
      message: "Class not found.",
    };
  }

  const groupExists = await prisma.group.findFirst({
    where: {
      id: data.groupId,
      classId: data.classId,
      class: {
        userId,
      },
    },
  });

  if (!groupExists) {
    return {
      success: false,
      message: "Group not found.",
    };
  }

  const student = await prisma.student.create({
    data: {
      ...data,
      studentCode: generateStudentCode(),
    },
  });

  return {
    success: true,
    message: "Student created successfully.",
    data: student,
  };
};

/*
 * Public student registration
 *
 * No account is required.
 * A unique device token is generated and returned once.
 */
export const registerStudentService = async (data: {
  name: string;
  phone?: string;
  parentPhone?: string;
  classId: string;
  groupId: string;
}) => {
  if (!data.name?.trim()) {
    return {
      success: false,
      message: "Student name is required.",
    };
  }

  if (!data.classId) {
    return {
      success: false,
      message: "Class is required.",
    };
  }

  if (!data.groupId) {
    return {
      success: false,
      message: "Group is required.",
    };
  }

  const classExists = await prisma.class.findUnique({
    where: {
      id: data.classId,
    },
  });

  if (!classExists) {
    return {
      success: false,
      message: "Class not found.",
    };
  }

  const groupExists = await prisma.group.findFirst({
    where: {
      id: data.groupId,
      classId: data.classId,
    },
  });

  if (!groupExists) {
    return {
      success: false,
      message: "Group not found.",
    };
  }

  const studentCode = generateStudentCode();
  const deviceToken = generateDeviceToken();

  const student = await prisma.student.create({
    data: {
      studentCode,
      deviceToken,
      name: data.name.trim(),
      phone: data.phone?.trim() || undefined,
      parentPhone: data.parentPhone?.trim() || undefined,
      monthlyFee: 0,
      classId: data.classId,
      groupId: data.groupId,
    },
    include: {
      class: true,
      group: true,
    },
  });

  return {
    success: true,
    message: "Student registered successfully.",
    data: {
      id: student.id,
      name: student.name,
      studentCode: student.studentCode,
      deviceToken: student.deviceToken,
      class: student.class,
      group: student.group,
    },
  };
};

/*
 * Public endpoint used by registration page
 */
export const getRegistrationClassesService = async () => {
  const classes = await prisma.class.findMany({
    select: {
      id: true,
      title: true,
      groups: {
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: "asc",
        },
      },
    },
    orderBy: {
      title: "asc",
    },
  });

  return {
    success: true,
    data: classes,
  };
};

export const getStudentsService = async (
  userId: string,
  search?: string,
  classId?: string,
  groupId?: string,
  page = 1,
  limit = 10
) => {
  const skip = (page - 1) * limit;

  const where: any = {
    class: {
      userId,
    },
  };

  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        studentCode: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (classId) {
    where.classId = classId;
  }

  if (groupId) {
    where.groupId = groupId;
  }

  const students = await prisma.student.findMany({
    where,
    include: {
      class: true,
      group: true,
    },
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await prisma.student.count({
    where,
  });

  return {
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: students,
  };
};

export const updateStudentService = async (
  id: string,
  data: StudentData,
  userId: string
) => {
  const exists = await prisma.student.findFirst({
    where: {
      id,
      class: {
        userId,
      },
    },
  });

  if (!exists) {
    return {
      success: false,
      message: "Student not found.",
    };
  }

  const classExists = await prisma.class.findFirst({
    where: {
      id: data.classId,
      userId,
    },
  });

  if (!classExists) {
    return {
      success: false,
      message: "Class not found.",
    };
  }

  const groupExists = await prisma.group.findFirst({
    where: {
      id: data.groupId,
      classId: data.classId,
      class: {
        userId,
      },
    },
  });

  if (!groupExists) {
    return {
      success: false,
      message: "Group not found.",
    };
  }

  const student = await prisma.student.update({
    where: {
      id,
    },
    data,
  });

  return {
    success: true,
    message: "Student updated successfully.",
    data: student,
  };
};

export const deleteStudentService = async (
  id: string,
  userId: string
) => {
  const exists = await prisma.student.findFirst({
    where: {
      id,
      class: {
        userId,
      },
    },
  });

  if (!exists) {
    return {
      success: false,
      message: "Student not found.",
    };
  }

  await prisma.student.delete({
    where: {
      id,
    },
  });

  return {
    success: true,
    message: "Student deleted successfully.",
  };
};

export const getStudentAttendanceService = async (
  studentId: string,
  userId: string
) => {
  const student = await prisma.student.findFirst({
    where: {
      id: studentId,
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

  const attendances = await prisma.attendance.findMany({
    where: {
      studentId,
    },
    orderBy: {
      date: "desc",
    },
  });

  return {
    success: true,
    data: attendances,
  };
};