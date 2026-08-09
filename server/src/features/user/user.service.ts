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
