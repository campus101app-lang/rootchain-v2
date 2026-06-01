import { Router } from "express";
import { prisma } from "../../lib/prisma.js";

const FILENAME = /^[0-9a-f-]{36}\.(jpg|jpeg|png|webp|pdf)$/i;

export const uploadServeRouter = Router();

uploadServeRouter.get("/:filename", async (req, res) => {
  const filename = req.params.filename;
  if (!FILENAME.test(filename)) {
    res.status(400).json({ success: false, error: { message: "Invalid filename" } });
    return;
  }

  const file = await prisma.storedFile.findUnique({ where: { filename } });
  if (!file) {
    res.status(404).json({ success: false, error: { message: "Not found" } });
    return;
  }

  res.setHeader("Content-Type", file.mimeType);
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.send(Buffer.from(file.data));
});
