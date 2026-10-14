import request from "supertest";
import { app } from "../src/app";
import * as viewsService from "../src/services/views.service";
import { AppError } from "../src/utils/AppError";

jest.mock("../src/services/views.service", () => ({ updateSubmissionViews: jest.fn() }));

const ID = "64b7f0f2a1b2c3d4e5f60009";
const url = `/api/submissions/${ID}/views`;

beforeEach(() => jest.clearAllMocks());

describe("PATCH /api/submissions/:id/views", () => {
  it("needs no token (it simulates platform data) and passes id and views to the service", async () => {
    jest.mocked(viewsService.updateSubmissionViews).mockResolvedValue({ ok: true } as never);
    const res = await request(app).patch(url).send({ views: 12_000 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: { ok: true } });
    expect(viewsService.updateSubmissionViews).toHaveBeenCalledWith(ID, 12_000);
  });

  it("accepts zero views", async () => {
    jest.mocked(viewsService.updateSubmissionViews).mockResolvedValue({} as never);
    expect((await request(app).patch(url).send({ views: 0 })).status).toBe(200);
  });

  it.each([
    ["negative", { views: -1 }],
    ["fractional", { views: 10.5 }],
    ["a string", { views: "12000" }],
    ["missing", {}],
    ["null", { views: null }],
  ])("400s when views is %s, without calling the service", async (_label, body) => {
    const res = await request(app).patch(url).send(body);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(viewsService.updateSubmissionViews).not.toHaveBeenCalled();
  });

  it("400s for a malformed submission id", async () => {
    const res = await request(app).patch("/api/submissions/nope/views").send({ views: 100 });
    expect(res.status).toBe(400);
    expect(viewsService.updateSubmissionViews).not.toHaveBeenCalled();
  });

  it("passes service errors through the error handler (404)", async () => {
    jest.mocked(viewsService.updateSubmissionViews).mockRejectedValue(AppError.notFound("Submission not found"));
    const res = await request(app).patch(url).send({ views: 100 });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("surfaces contention as 409 CONCURRENT_UPDATE", async () => {
    jest
      .mocked(viewsService.updateSubmissionViews)
      .mockRejectedValue(new AppError(409, "CONCURRENT_UPDATE", "too many requests"));
    const res = await request(app).patch(url).send({ views: 100 });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONCURRENT_UPDATE");
  });
});
