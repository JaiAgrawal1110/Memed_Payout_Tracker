import { app } from "./app";
import { env } from "./config/env";
import { connectDB, disconnectDB } from "./config/db";

async function start(): Promise<void> {
  await connectDB();
  const server = app.listen(env.PORT, () => console.log(`Server running on port ${env.PORT}`));

  const shutdown = (signal: string) => {
    console.log(`${signal} received, shutting down`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
