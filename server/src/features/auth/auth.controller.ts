import { Request, Response } from "express";
import { loginService } from "./auth.service";

export const login = async (req: Request, res: Response) => {
  const result = await loginService(req.body);

  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.status(200).json(result);
};