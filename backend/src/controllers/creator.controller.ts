import type { Request, Response } from "express";
import { getAuthUser } from "../middleware/auth";
import * as submissionService from "../services/submission.service";

export async function getMyEarnings(req: Request, res: Response): Promise<void> {
  const earnings = await submissionService.getCreatorEarnings(getAuthUser(req).id);
  res.json({ success: true, data: earnings });
}
