import request from "supertest";
import { app } from "../src/app";

describe("central error handler", () => {
  it("returns a JSON 404 for unknown routes", async () => {
    const res = await request(app).get("/nope");
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false, error: { code: "NOT_FOUND" } });
  });

  it("returns a JSON 400 for malformed JSON bodies", async () => {
    const res = await request(app).post("/anything").set("Content-Type", "application/json").send("{bad");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_JSON");
  });
});
