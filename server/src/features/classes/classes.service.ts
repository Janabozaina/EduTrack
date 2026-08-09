import prisma from "../../shared/lib/prisma";

export const createClassService = async (
  title: string,
  userId: string
) => {
  const exists = await prisma.class.findFirst({
    where: {
      title,
      userId,
    },
  });

  if (exists) {
    return {
      success: false,
      message: "Class already exists.",
    };
  }

  const newClass = await prisma.class.create({
    data: {
      title,
      userId,
    },
  });

  return {
    success: true,
    message: "Class created successfully.",
    data: newClass,
  };
};

export const getClassesService = async (userId: string) => {
  const classes = await prisma.class.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          groups: true,
          students: true,
        },
      },
    },
  });

  return {
    success: true,
    data: classes,
  };
};

export const updateClassService = async (
  id: string,
  title: string,
  userId: string
) => {
  const exists = await prisma.class.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!exists) {
    return {
      success: false,
      message: "Class not found.",
    };
  }

  const updated = await prisma.class.update({
    where: {
      id,
    },
    data: {
      title,
    },
  });

  return {
    success: true,
    message: "Class updated successfully.",
    data: updated,
  };
};

export const deleteClassService = async (
  id: string,
  userId: string
) => {
  const exists = await prisma.class.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!exists) {
    return {
      success: false,
      message: "Class not found.",
    };
  }

  await prisma.class.delete({
    where: {
      id,
    },
  });

  return {
    success: true,
    message: "Class deleted successfully.",
  };
};