import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.resolve(
  __dirname,
  "..", // up to /server
  "..", // up to /src
  "..", // up to /validation_tool.ts
  "..", // up to /dagster_card_processor
  "dagster_card_processor",
  "cards_to_process",
);

// Ensure the upload directory exists upon server startup
fs.mkdir(UPLOAD_DIR, { recursive: true });

const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Only PDF, JPG, and PNG are allowed.`,
      ),
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per file
});

const router: Router = Router();

// Wrap the middleware execution in the route handler to catch errors
router.post("/", (req: Request, res: Response) => {
  const uploader = upload.array("files");

  uploader(req, res, async function (err) {
    if (err) {
      // This catches errors from fileFilter (invalid type) and other multer errors
      return res.status(400).json({ error: err.message });
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files were uploaded." });
    }

    const results = [];
    for (const file of files) {
      try {
        const hash = crypto
          .createHash("sha256")
          .update(file.buffer)
          .digest("hex");
        const extension = path.extname(file.originalname).toLowerCase();
        const newFilename = `${hash}${extension}`;
        const newFilePath = path.join(UPLOAD_DIR, newFilename);

        try {
          await fs.access(newFilePath);
          results.push({
            originalName: file.originalname,
            status: "skipped",
            reason: "Duplicate content already exists on server.",
          });
        } catch {
          await fs.writeFile(newFilePath, file.buffer);
          results.push({
            originalName: file.originalname,
            status: "success",
            newName: newFilename,
          });
        }
      } catch (error) {
        results.push({
          originalName: file.originalname,
          status: "error",
          reason:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        });
      }
    }

    return res.status(200).json({
      message: "Upload process completed.",
      results: results,
    });
  });
});

export default router;
