import type { Request, Response } from "express";
import { getAuthUser } from "../middleware/auth";
import * as campaignService from "../services/campaign.service";
import * as submissionService from "../services/submission.service";

export async function createCampaign(req: Request, res: Response): Promise<void> {
  const campaign = await campaignService.createCampaign(getAuthUser(req).id, req.body);
  res.status(201).json({ success: true, data: { campaign } });
}

export async function listMyCampaigns(req: Request, res: Response): Promise<void> {
  const campaigns = await campaignService.listBrandCampaigns(getAuthUser(req).id);
  res.json({ success: true, data: { campaigns } });
}

export async function listLiveCampaigns(_req: Request, res: Response): Promise<void> {
  const campaigns = await campaignService.listLiveCampaigns();
  res.json({ success: true, data: { campaigns } });
}

export async function submitPost(req: Request, res: Response): Promise<void> {
  const submission = await submissionService.createSubmission(
    getAuthUser(req).id,
    String(req.params.id),
    req.body.postLink,
  );
  res.status(201).json({ success: true, data: { submission } });
}
