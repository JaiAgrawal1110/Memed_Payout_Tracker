import express from "express";
import request from "supertest";
import { authenticate, requireRole } from "../src/middleware/auth";
import { errorHandler } from "../src/middleware/errorHandler";
import { signToken } from "../src/utils/jwt";

const app = express();
app.get("/any", authenticate, (req, res) => res.json({ user: req.user }));
app.get("/brand-only", authenticate, requireRole("brand"), (_req, res) => res.json({ ok: true }));
app.use(errorHandler);

const bearer = (role: "brand" | "creator") => `Bearer ${signToken({ id: "u1", role })}`;

describe("authenticate", () => {
  it("401s without a header", async () => {
    const res = await request(app).get("/any");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("401s with a garbage token", async () => {
    const res = await request(app).get("/any").set("Authorization", "Bearer not.a.token");
    expect(res.status).toBe(401);
  });

  it("attaches the user for a valid token", async () => {
    const res = await request(app).get("/any").set("Authorization", bearer("creator"));
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ id: "u1", role: "creator" });
  });
});

describe("requireRole", () => {
  it("403s for the wrong role", async () => {
    const res = await request(app).get("/brand-only").set("Authorization", bearer("creator"));
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("allows the right role", async () => {
    const res = await request(app).get("/brand-only").set("Authorization", bearer("brand"));
    expect(res.status).toBe(200);
  });
});