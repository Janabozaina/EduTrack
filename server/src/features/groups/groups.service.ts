import prisma from "../../shared/lib/prisma";

export const createGroupService = async (
  name: string,
  classId: string,
  userId: string,
  day?: string,
  startTime?: string,
  room?: string
) => {
  const classExists = await prisma.class.findFirst({
    where: {
      id: classId,
      userId,
    },
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

export const getGroupsService = async (
  userId: string,
  classId?: string
) => {
  const where: any = {
    class: {
      userId,
    },
  };

  if (classId) {
    where.classId = classId;
  }

  const groups = await prisma.group.findMany({
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

  return groups;
};

export const updateGroupService = async (
  id: string,
  name: string,
  userId: string,
  day?: string,
  startTime?: string,
  room?: string
) => {
  const exists = await prisma.group.findFirst({
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
      message: "Group not found.",
    };
  }

  const group = await prisma.group.update({
    where: {
      id,
    },
    data: {
      name,
      day,
      startTime,
      room,
    },
  });

  return {
    success: true,
    message: "Group updated successfully.",
    data: group,
  };
};

export const deleteGroupService = async (
  id: string,
  userId: string
) => {
  const exists = await prisma.group.findFirst({
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
      message: "Group not found.",
    };
  }

  await prisma.group.delete({
    where: {
      id,
    },
  });

  return {
    success: true,
    message: "Group deleted successfully.",
  };
};