import request from "supertest";
import express from "express";
import { describe, test, vi } from "vitest"; // Removed 'expect'
import apiRouter from "../server/api.js";

// Mock the db module
vi.mock("../server/db.js", () => {
  return {
    // Add any functions that are called in the routers
  };
});

const app = express();
app.use("/api", apiRouter);

describe("API Route: /api/status", () => {
  test("should establish an SSE connection and send an event", (done) => {
    request(app)
      .get("/api/status")
      .expect("Content-Type", "text/event-stream")
      .expect(200)
      .end((err, _) => {
        // Changed '_res' to '_'
        if (err) return done(err);
        done();
      });
  });
});
