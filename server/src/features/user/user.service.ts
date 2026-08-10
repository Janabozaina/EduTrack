import bcrypt from "bcrypt";

import prisma from "../../shared/lib/prisma";
import { ChangePasswordInput, UpdateProfileInput, UserProfile } from "./user.types";
import { validatePasswordChange, validateProfileUpdate } from "./user.validation";

export const getUserProfileService = async (userId: string): Promise<UserProfile | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  return user;
};

export const updateUserProfileService = async (
  userId: string,
  data: UpdateProfileInput
): Promise<{ success: boolean; message: string; user?: UserProfile }> => {
  const validation = validateProfileUpdate(data);

  if (!validation.success) {
    return validation;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser && existingUser.id !== userId) {
    return {
      success: false,
      message: "This email is already in use.",
    };
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      email: data.email,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  return {
    success: true,
    message: "Profile updated successfully.",
    user,
  };
};

export const changeUserPasswordService = async (
  userId: string,
  data: ChangePasswordInput
): Promise<{ success: boolean; message: string }> => {
  const validation = validatePasswordChange(data);

  if (!validation.success) {
    return validation;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return {
      success: false,
      message: "User not found.",
    };
  }

  const isCorrectPassword = await bcrypt.compare(data.currentPassword, user.password);

  if (!isCorrectPassword) {
    return {
      success: false,
      message: "Current password is incorrect.",
    };
  }

  const hashedPassword = await bcrypt.hash(data.newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return {
    success: true,
    message: "Password changed successfully.",
  };

  
};
export const getAllUsersService = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    success: true,
    data: users,
  };
};


export const createUserService = async (
  name: string,
  email: string,
  password: string,
  role: "ADMIN" | "TEACHER"
) => {
  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    return {
      success: false,
      message: "Name, email and password are required.",
    };
  }

  if (password.length < 6) {
    return {
      success: false,
      message: "Password must be at least 6 characters.",
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    return {
      success: false,
      message: "This email is already in use.",
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return {
    success: true,
    message: "User created successfully.",
    data: user,
  };
};


export const updateUserByAdminService = async (
  id: string,
  data: {
    name: string;
    email: string;
    role: "ADMIN" | "TEACHER";
  }
) => {
  if (!data.name?.trim() || !data.email?.trim()) {
    return {
      success: false,
      message: "Name and email are required.",
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existingUser && existingUser.id !== id) {
    return {
      success: false,
      message: "This email is already in use.",
    };
  }

  const userExists = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!userExists) {
    return {
      success: false,
      message: "User not found.",
    };
  }

  const user = await prisma.user.update({
    where: {
      id,
    },
    data: {
      name: data.name,
      email: data.email,
      role: data.role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return {
    success: true,
    message: "User updated successfully.",
    data: user,
  };
};

export const deleteUserByAdminService = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    include: {
      classes: true,
    },
  });

  if (!user) {
    return {
      success: false,
      message: "User not found.",
    };
  }

  if (user.classes.length > 0) {
    return {
      success: false,
      message: "Cannot delete a user who has classes assigned to them.",
    };
  }

  await prisma.user.delete({
    where: {
      id,
    },
  });

  return {
    success: true,
    message: "User deleted successfully.",
  };
};