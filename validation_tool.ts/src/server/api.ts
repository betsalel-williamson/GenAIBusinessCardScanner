import { Router } from "express";
import {
  filesRouter,
  autosaveRouter,
  commitRouter,
  sourceDataRouter,
  ingestRouter,
  uploadRouter,
  statusRouter,
} from "./routes/index.js";

const router: Router = Router();

router.use("/files", filesRouter);
router.use("/autosave", autosaveRouter);
router.use("/commit", commitRouter);
router.use("/source-data", sourceDataRouter);
router.use("/ingest", ingestRouter);
router.use("/upload", uploadRouter);
router.use("/status", statusRouter);

export default router;
