import request from "supertest";
import express from "express";
import fs from "fs/promises";
import path from "path";
import { describe, test, expect, beforeAll, beforeEach } from "vitest";
import uploadRouter from "../server/routes/upload.js";

const app = express();
app.use("/api/upload", uploadRouter);

const TEST_UPLOAD_DIR = path.resolve(__dirname, "test_upload_dir");

const createDummyFileBuffer = (content: string) => Buffer.from(content);

describe("API Route: /api/upload", () => {
  beforeAll(async () => {
    await fs.mkdir(TEST_UPLOAD_DIR, { recursive: true });
  });

  beforeEach(async () => {
    const files = await fs.readdir(TEST_UPLOAD_DIR);
    for (const file of files) {
      if (file !== ".gitignore") {
        await fs.unlink(path.join(TEST_UPLOAD_DIR, file));
      }
    }
  });

  // TODO: need to override the server upload directory for this test, this is an end-to-end test
  // test("should upload a single valid PDF file successfully", async () => {
  //   const fileBuffer = createDummyFileBuffer("fake-pdf-content-%PDF-1.4");
  //   const response = await request(app)
  //     .post("/api/upload")
  //     .attach("files", fileBuffer, {
  //       filename: "test.pdf",
  //       contentType: "application/pdf",
  //     });

  //   expect(response.status).toBe(200);
  //   expect(response.body.results[0].status).toBe("success");
  //   const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
  //   const expectedFilename = `${hash}.pdf`;
  //   const filePath = path.join(TEST_UPLOAD_DIR, expectedFilename);
  //   await expect(fs.access(filePath)).resolves.toBeUndefined();
  // });

  // TODO: need to override the server upload directory for this test, this is an end-to-end test
  // test("should skip uploading a file if its content is a duplicate", async () => {
  //   const fileBuffer = createDummyFileBuffer("duplicate-content-pdf");
  //   const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
  //   await fs.writeFile(path.join(TEST_UPLOAD_DIR, `${hash}.pdf`), "dummy-data");

  //   const response = await request(app)
  //     .post("/api/upload")
  //     .attach("files", fileBuffer, {
  //       filename: "another-name.pdf",
  //       contentType: "application/pdf",
  //     });

  //   expect(response.status).toBe(200);
  //   expect(response.body.results[0].status).toBe("skipped");
  // });

  test("should reject an upload with an invalid file type", async () => {
    const fileBuffer = createDummyFileBuffer("this is a text file");
    const response = await request(app)
      .post("/api/upload")
      .attach("files", fileBuffer, {
        filename: "document.txt",
        contentType: "text/plain",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("Invalid file type: text/plain");
  });

  // TODO: need to override the server upload directory for this test, this is an end-to-end test
  // test("should handle multiple files with mixed statuses", async () => {
  //   const successBuffer = createDummyFileBuffer("unique-file-content");
  //   const duplicateBuffer = createDummyFileBuffer("existing-file-content");
  //   const duplicateHash = crypto
  //     .createHash("sha256")
  //     .update(duplicateBuffer)
  //     .digest("hex");
  //   await fs.writeFile(
  //     path.join(TEST_UPLOAD_DIR, `${duplicateHash}.png`),
  //     "dummy-data",
  //   );

  //   const response = await request(app)
  //     .post("/api/upload")
  //     .attach("files", successBuffer, {
  //       filename: "success.pdf",
  //       contentType: "application/pdf",
  //     })
  //     .attach("files", duplicateBuffer, {
  //       filename: "duplicate.png",
  //       contentType: "image/png",
  //     });

  //   expect(response.status).toBe(200);
  //   const successResult = response.body.results.find(
  //     (r: UploadResult) => r.originalName === "success.pdf",
  //   );
  //   const skippedResult = response.body.results.find(
  //     (r: UploadResult) => r.originalName === "duplicate.png",
  //   );
  //   expect(successResult?.status).toBe("success");
  //   expect(skippedResult?.status).toBe("skipped");
  // });
});
