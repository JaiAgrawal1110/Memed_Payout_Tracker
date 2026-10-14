import type { Request, Response } from "express";
import * as viewsService from "../services/views.service";

export async function updateViews(req: Request, res: Response): Promise<void> {
  const result = await viewsService.updateSubmissionViews(String(req.params.id), req.body.views);
  res.json({ success: true, data: result });
}
