import { Router } from "express";
import filesRouter from "./routes/files.js";
import autosaveRouter from "./routes/autosave.js";
import commitRouter from "./routes/commit.js";
import sourceDataRouter from "./routes/sourceData.js";
import ingestRouter from "./routes/ingest.js";
import uploadRouter from "./routes/upload.js";

const router: Router = Router();

router.use("/files", filesRouter);
router.use("/autosave", autosaveRouter);
router.use("/commit", commitRouter);
router.use("/source-data", sourceDataRouter);
router.use("/ingest", ingestRouter);
router.use("/upload", uploadRouter);

export default router;
