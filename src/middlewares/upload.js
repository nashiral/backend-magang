import multer from "multer";
import fs from "fs";
import path from "path";
import { env } from "../config/env.js";

if (!fs.existsSync(env.uploadDir)) fs.mkdirSync(env.uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, env.uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

function fileFilter(req, file, cb) {
  if (file.fieldname === "cv") {
    if (file.mimetype !== "application/pdf") return cb(new Error("CV harus PDF"));
    return cb(null, true);
  }

  if (file.fieldname === "ig_proof") {
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.mimetype)) {
      return cb(new Error("Bukti follow IG harus gambar (PNG/JPG/WebP)"));
    }
    return cb(null, true);
  }

  cb(new Error("Field file tidak dikenali"));
}

export const uploadApplyFiles = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } 
}).fields([
  { name: "cv", maxCount: 1 },
  { name: "ig_proof", maxCount: 1 }
]);
