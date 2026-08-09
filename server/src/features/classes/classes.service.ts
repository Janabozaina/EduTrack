import prisma from "../../shared/lib/prisma";

export const createClassService = async (title: string) => {
  const exists = await prisma.class.findFirst({
    where: { title },
  });

  if (exists) {
    return {
      success: false,
      message: "Class already exists.",
    };
  }

  const newClass = await prisma.class.create({
    data: { title },
  });

  return {
    success: true,
    message: "Class created successfully.",
    data: newClass,
  };
};

export const getClassesService = async () => {
  const classes = await prisma.class.findMany({
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
  title: string
) => {
  const exists = await prisma.class.findUnique({
    where: { id },
  });

  if (!exists) {
    return {
      success: false,
      message: "Class not found.",
    };
  }

  const updated = await prisma.class.update({
    where: { id },
    data: { title },
  });

  return {
    success: true,
    message: "Class updated successfully.",
    data: updated,
  };
};

export const deleteClassService = async (id: string) => {
  const exists = await prisma.class.findUnique({
    where: { id },
  });

  if (!exists) {
    return {
      success: false,
      message: "Class not found.",
    };
  }

  await prisma.class.delete({
    where: { id },
  });

  return {
    success: true,
    message: "Class deleted successfully.",
  };
};