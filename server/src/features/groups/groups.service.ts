import prisma from "../../shared/lib/prisma";

export const createGroupService = async (
  name: string,
  classId: string,
  day?: string,
  startTime?: string,
  room?: string
) => {
  const classExists = await prisma.class.findUnique({
    where: { id: classId },
  });

  if (!classExists) {
    return {
      success: false,
      message: "Class not found.",
    };
  }

  const group = await prisma.group.create({
    data: {
      name,
      classId,
      day,
      startTime,
      room,
    },
  });

  return {
    success: true,
    message: "Group created successfully.",
    data: group,
  };
};

export const getGroupsService = async (classId?: string) => {
  const where = classId ? { classId } : undefined;

  return prisma.group.findMany({
    where,
    include: {
      class: true,
      _count: {
        select: {
          students: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const updateGroupService = async (
  id: string,
  name: string,
  day?: string,
  startTime?: string,
  room?: string
) => {
  return prisma.group.update({
    where: { id },
    data: {
      name,
      day,
      startTime,
      room,
    },
  });
};

export const deleteGroupService = async (id: string) => {
  return prisma.group.delete({
    where: {
      id,
    },
  });
};
