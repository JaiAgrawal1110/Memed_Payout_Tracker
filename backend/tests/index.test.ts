import request from "supertest";
import { app } from "../src/app";

describe("API index routes", () => {
  it("GET / describes the service", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("GET /api lists the endpoints", async () => {
    const res = await request(app).get("/api");
    expect(res.status).toBe(200);
    expect(res.body.endpoints).toContain("PATCH /api/submissions/:id/views");
  });
});