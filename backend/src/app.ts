import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { apiRouter } from "./routes";

export const app = express();

// Render/Vercel sit behind a proxy; needed so rate limiting sees the real client IP.
app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()) }));
app.use(express.json());
if (env.NODE_ENV !== "test") app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", db: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});
app.get("/", (_req, res) => {
  res.json({ name: "Meme'd Payout Tracker API", status: "ok", health: "/health", api: "/api" });
});

app.use("/api", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);