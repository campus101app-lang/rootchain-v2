import { Router } from "express";
import { randomUUID } from "node:crypto";
import { requireAuth } from "../../middleware/auth.js";
import { prisma } from "../../lib/prisma.js";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const MAX_BYTES = 5 * 1024 * 1024;

export const uploadRouter = Router();

uploadRouter.post("/", requireAuth, async (req, res) => {
  try {
    const { filename, mimeType, dataBase64 } = req.body as {
      filename?: string;
      mimeType?: string;
      dataBase64?: string;
    };

    if (!dataBase64 || !mimeType || !ALLOWED.has(mimeType)) {
      res.status(400).json({ success: false, error: { message: "Invalid upload payload" } });
      return;
    }

    const buf = Buffer.from(dataBase64, "base64");
    if (buf.length > MAX_BYTES) {
      res.status(400).json({ success: false, error: { message: "File too large (max 5MB)" } });
      return;
    }

    const ext =
      mimeType === "image/png"
        ? ".png"
        : mimeType === "image/webp"
          ? ".webp"
          : mimeType === "application/pdf"
            ? ".pdf"
            : ".jpg";
    const id = randomUUID();
    const storedName = `${id}${ext}`;

    await prisma.storedFile.create({
      data: {
        id,
        filename: storedName,
        mimeType,
        data: buf,
      },
    });

    const url = `/uploads/${storedName}`;
    res.status(201).json({
      success: true,
      data: { url, filename: filename ?? storedName },
    });
  } catch (e) {
    res.status(500).json({ success: false, error: { message: e instanceof Error ? e.message : "Upload failed" } });
  }
});
