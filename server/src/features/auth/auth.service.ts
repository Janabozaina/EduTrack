import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import prisma from "../../shared/lib/prisma";
import { JWT_SECRET } from "../../shared/config/jwt";
import { LoginInput, LoginResponse } from "./auth.types";
import { validateLogin } from "./auth.validation";

export const loginService = async (
  data: LoginInput
): Promise<LoginResponse> => {
  const validation = validateLogin(data);

  if (!validation.success) {
    return validation;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    return {
      success: false,
      message: "Invalid email or password.",
    };
  }

  const isPasswordCorrect = await bcrypt.compare(
    data.password,
    user.password
  );

  if (!isPasswordCorrect) {
    return {
      success: false,
      message: "Invalid email or password.",
    };
  }

const token = jwt.sign(
  {
    id: user.id,
    email: user.email,
    role: user.role,
  },
  JWT_SECRET,
  {
    expiresIn: "7d",
  }
);

  return {
    success: true,
    message: "Login successful ✅",
    data: {
      user: {
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
},
      token,
    },
  };
};