import { Router, Request, Response } from "express";
import { loadSourceData } from "../utils.js";

const router: Router = Router();

router.get("/:json_filename", async (req: Request, res: Response) => {
  const { json_filename } = req.params;
  try {
    const sourceData = await loadSourceData(json_filename);
    if (!sourceData) {
      return res
        .status(404)
        .json({ error: `Source data for '${json_filename}' not found.` });
    }
    res.json(sourceData);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to retrieve source data from database." });
  }
});

export default router;
