import { ChangePasswordInput, UpdateProfileInput } from "./user.types";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateProfileUpdate = (data: UpdateProfileInput) => {
  if (!data.name?.trim() || !data.email?.trim()) {
    return {
      success: false,
      message: "Name and email are required.",
    };
  }

  if (!emailRegex.test(data.email)) {
    return {
      success: false,
      message: "Please enter a valid email address.",
    };
  }

  return {
    success: true,
    message: "Validation passed.",
  };
};

export const validatePasswordChange = (data: ChangePasswordInput) => {
  if (!data.currentPassword?.trim() || !data.newPassword?.trim()) {
    return {
      success: false,
      message: "Both current password and new password are required.",
    };
  }

  if (data.newPassword.length < 6) {
    return {
      success: false,
      message: "New password must be at least 6 characters.",
    };
  }

  if (data.currentPassword === data.newPassword) {
    return {
      success: false,
      message: "New password must be different from the current password.",
    };
  }

  return {
    success: true,
    message: "Validation passed.",
  };
};
