import { Router, Request, Response } from "express";

const router: Router = Router();

router.get("/", (req: Request, res: Response) => {
  // Set headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  // Immediately flush the headers to establish the connection
  res.flushHeaders();

  const sendEvent = (data: object) => {
    // SSE protocol requires data to be prefixed with "data: " and followed by two newlines
    const sseFormattedData = `data: ${JSON.stringify(data)}\n\n`;
    res.write(sseFormattedData);
  };

  // As a test, send an event every 3 seconds
  const intervalId = setInterval(() => {
    sendEvent({ message: "This is a test event", timestamp: new Date() });
  }, 3000);

  // When the client closes the connection, stop sending events
  req.on("close", () => {
    clearInterval(intervalId);
    res.end();
  });
});

export default router;

