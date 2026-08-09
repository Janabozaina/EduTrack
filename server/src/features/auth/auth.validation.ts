import { LoginInput } from "./auth.types";

export const validateLogin = (data: LoginInput) => {
  const { email, password } = data;

  if (!email || !password) {
    return {
      success: false,
      message: "Email and password are required.",
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return {
      success: false,
      message: "Invalid email address.",
    };
  }

  if (password.length < 6) {
    return {
      success: false,
      message: "Password must be at least 6 characters.",
    };
  }

  return {
    success: true,
    message: "Validation passed.",
  };
};