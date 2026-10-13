// Runs before every test file: gives config/env.ts valid values without needing a real database.
process.env.NODE_ENV = "test";
process.env.MONGO_URI = "mongodb://localhost:27017/memed-test";
process.env.JWT_SECRET = "test-secret-at-least-16-chars";
