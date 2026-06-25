import { Router } from "express";
import multer from "multer";
import { supabase, throwIfSupabaseError } from "../db/client.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const upload = multer({
  storage: multer.memoryStorage(),
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

uploadRouter.post("/image", authMiddleware, upload.single("image"), async (req, res, next) => {
  if (!req.file) return res.status(400).json({ message: "이미지 파일은 필수입니다." });

  try {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "media";
    const extension = req.file.originalname.includes(".") ? req.file.originalname.split(".").pop().toLowerCase() : "bin";
    const objectPath = `uploads/${req.user.id}/${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;

    const { error } = await supabase.storage.from(bucket).upload(objectPath, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: false,
    });
    throwIfSupabaseError(error);

    const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
    return res.status(201).json({ imageUrl: data.publicUrl });
  } catch (error) {
    return next(error);
  }
});
