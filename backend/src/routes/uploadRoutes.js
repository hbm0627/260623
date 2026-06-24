import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..", "..");
const mediaDir = path.join(backendRoot, "media");

fs.mkdirSync(mediaDir, { recursive: true });

const storage = multer.diskStorage({
  destination: mediaDir,
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    callback(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new Error("이미지 파일만 업로드할 수 있습니다."));
      return;
    }
    callback(null, true);
  },
});

export const uploadRouter = Router();

uploadRouter.post("/image", authMiddleware, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "이미지 파일은 필수입니다." });

  res.status(201).json({
    imageUrl: `/media/${req.file.filename}`,
  });
});
