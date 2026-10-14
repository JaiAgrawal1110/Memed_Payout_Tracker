import type { Request, Response } from "express";
import { getAuthUser } from "../middleware/auth";
import * as authService from "../services/auth.service";

export async function signup(req: Request, res: Response): Promise<void> {
  const result = await authService.signup(req.body);
  res.status(201).json({ success: true, data: result });
}

export async function login(req: Request, res: Response): Promise<void> {
  const result = await authService.login(req.body);
  res.json({ success: true, data: result });
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await authService.getProfile(getAuthUser(req).id);
  res.json({ success: true, data: { user } });
}