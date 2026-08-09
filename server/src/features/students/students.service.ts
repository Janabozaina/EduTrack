import prisma from "../../shared/lib/prisma";

function generateStudentCode() {
  return `EDU-${Date.now()}`;
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