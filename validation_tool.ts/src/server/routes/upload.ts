import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

// UPLOAD_DIR should point to the mounted volume for cards to process
const UPLOAD_DIR =
  process.env.CARDS_TO_PROCESS_MOUNT_PATH || "/mnt/cards_to_process";

// Ensure the upload directory exists upon server startup
// In a Dockerized environment with mounted volumes, this directory should already exist.
// However, for local development without Docker, it's good to ensure it's there.
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
          // Attempt to write the file exclusively. If it already exists, this will throw an error.
          await fs.writeFile(newFilePath, file.buffer, { flag: "wx" });
          results.push({
            originalName: file.originalname,
            status: "success",
            newName: newFilename,
          });
        } catch (writeError) {
          // If the file already exists (EEXIST error from 'wx' flag), mark as skipped.
          if (
            writeError &&
            typeof writeError === "object" &&
            "code" in writeError &&
            writeError.code === "EEXIST"
          ) {
            results.push({
              originalName: file.originalname,
              status: "skipped",
              reason: "File with identical content already exists on server.",
            });
          } else {
            // Re-throw other write errors
            throw writeError;
          }
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
