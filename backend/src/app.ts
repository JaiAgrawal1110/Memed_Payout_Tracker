import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()) }));
app.use(express.json());
if (env.NODE_ENV !== "test") app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", db: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

// Feature routers get mounted here in later phases.

app.use(notFoundHandler);
app.use(errorHandler);
