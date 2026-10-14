// Runs before every test file: gives config/env.ts valid values and keeps tests away from real data.
import dotenv from "dotenv";

// Load .env only so optional MONGO_URI_TEST is available to the concurrency test.
dotenv.config({ quiet: true });

process.env.NODE_ENV = "test";
process.env.MONGO_URI = "mongodb://localhost:27017/memed-test";
process.env.JWT_SECRET = "test-secret-at-least-16-chars";
delete process.env.REDIS_URL;
