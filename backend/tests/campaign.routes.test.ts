import request from "supertest";
import { app } from "../src/app";
import * as campaignService from "../src/services/campaign.service";
import * as submissionService from "../src/services/submission.service";
import { signToken } from "../src/utils/jwt";
import { LADDER } from "./fixtures";

// These tests cover routing, auth, role guards and validation. The services are mocked, so no database is needed.
jest.mock("../src/services/campaign.service", () => ({
  createCampaign: jest.fn(),
  listBrandCampaigns: jest.fn(),
  listLiveCampaigns: jest.fn(),
}));
jest.mock("../src/services/submission.service", () => ({
  createSubmission: jest.fn(),
  getCreatorEarnings: jest.fn(),
}));

const BRAND_ID = "64b7f0f2a1b2c3d4e5f60001";
const CREATOR_ID = "64b7f0f2a1b2c3d4e5f60002";
const CAMPAIGN_ID = "64b7f0f2a1b2c3d4e5f60003";

const brandAuth = `Bearer ${signToken({ id: BRAND_ID, role: "brand" })}`;
const creatorAuth = `Bearer ${signToken({ id: CREATOR_ID, role: "creator" })}`;

const validBody = { name: "Summer Drop", platform: "instagram", totalBudget: 50_000, ladder: LADDER };

beforeEach(() => jest.clearAllMocks());

describe("POST /api/campaigns", () => {
  it("401s without a token", async () => {
    const res = await request(app).post("/api/campaigns").send(validBody);
    expect(res.status).toBe(401);
  });

  it("403s for creators", async () => {
    const res = await request(app).post("/api/campaigns").set("Authorization", creatorAuth).send(validBody);
    expect(res.status).toBe(403);
    expect(campaignService.createCampaign).not.toHaveBeenCalled();
  });

  it("400s with details for an invalid ladder, and never reaches the service", async () => {
    const res = await request(app)
      .post("/api/campaigns")
      .set("Authorization", brandAuth)
      .send({ ...validBody, ladder: [{ views: 100, payout: 9 }, { views: 100, payout: 5 }] });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details[0].message).toMatch(/Duplicate/);
    expect(campaignService.createCampaign).not.toHaveBeenCalled();
  });

  it("201s and passes the brand id and a sorted ladder to the service", async () => {
    jest.mocked(campaignService.createCampaign).mockResolvedValue({ id: CAMPAIGN_ID } as never);
    const res = await request(app)
      .post("/api/campaigns")
      .set("Authorization", brandAuth)
      .send({ ...validBody, ladder: [LADDER[2], LADDER[0], LADDER[1]] });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ success: true, data: { campaign: { id: CAMPAIGN_ID } } });
    expect(campaignService.createCampaign).toHaveBeenCalledWith(BRAND_ID, { ...validBody, ladder: LADDER });
  });
});

describe("GET /api/campaigns/mine", () => {
  it("returns the brand's campaigns", async () => {
    jest.mocked(campaignService.listBrandCampaigns).mockResolvedValue([] as never);
    const res = await request(app).get("/api/campaigns/mine").set("Authorization", brandAuth);
    expect(res.status).toBe(200);
    expect(campaignService.listBrandCampaigns).toHaveBeenCalledWith(BRAND_ID);
  });

  it("403s for creators", async () => {
    const res = await request(app).get("/api/campaigns/mine").set("Authorization", creatorAuth);
    expect(res.status).toBe(403);
  });
});

describe("GET /api/campaigns", () => {
  it("lists live campaigns for creators", async () => {
    jest.mocked(campaignService.listLiveCampaigns).mockResolvedValue([] as never);
    const res = await request(app).get("/api/campaigns").set("Authorization", creatorAuth);
    expect(res.status).toBe(200);
    expect(res.body.data.campaigns).toEqual([]);
  });

  it("403s for brands and 401s for anonymous users", async () => {
    expect((await request(app).get("/api/campaigns").set("Authorization", brandAuth)).status).toBe(403);
    expect((await request(app).get("/api/campaigns")).status).toBe(401);
  });
});

describe("POST /api/campaigns/:id/submissions", () => {
  const url = `/api/campaigns/${CAMPAIGN_ID}/submissions`;
  const link = "https://www.instagram.com/reel/AbC123/";

  it("201s and passes creator id, campaign id and link to the service", async () => {
    jest.mocked(submissionService.createSubmission).mockResolvedValue({ id: "s1" } as never);
    const res = await request(app).post(url).set("Authorization", creatorAuth).send({ postLink: link });
    expect(res.status).toBe(201);
    expect(submissionService.createSubmission).toHaveBeenCalledWith(CREATOR_ID, CAMPAIGN_ID, link);
  });

  it("400s for a malformed campaign id", async () => {
    const res = await request(app)
      .post("/api/campaigns/not-an-id/submissions")
      .set("Authorization", creatorAuth)
      .send({ postLink: link });
    expect(res.status).toBe(400);
    expect(submissionService.createSubmission).not.toHaveBeenCalled();
  });

  it("400s when postLink is missing", async () => {
    const res = await request(app).post(url).set("Authorization", creatorAuth).send({});
    expect(res.status).toBe(400);
  });

  it("403s for brands", async () => {
    const res = await request(app).post(url).set("Authorization", brandAuth).send({ postLink: link });
    expect(res.status).toBe(403);
  });
});

describe("GET /api/creators/me/earnings", () => {
  it("returns earnings for creators", async () => {
    jest.mocked(submissionService.getCreatorEarnings).mockResolvedValue({
      totalEarnings: 2_500,
      submissionCount: 1,
      submissions: [],
    });
    const res = await request(app).get("/api/creators/me/earnings").set("Authorization", creatorAuth);
    expect(res.status).toBe(200);
    expect(res.body.data.totalEarnings).toBe(2_500);
    expect(submissionService.getCreatorEarnings).toHaveBeenCalledWith(CREATOR_ID);
  });

  it("403s for brands", async () => {
    const res = await request(app).get("/api/creators/me/earnings").set("Authorization", brandAuth);
    expect(res.status).toBe(403);
  });
});
