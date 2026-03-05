import fs from "fs";
import path from "path";
import { env } from "../config/env.js";

export function getUploadAbsPath(filename) {
  return path.resolve(env.uploadDir, filename);
}

export function ensureFileExists(absPath) {
  if (!fs.existsSync(absPath)) {
    const err = new Error("File not found");
    err.statusCode = 404;
    throw err;
  }
}

function guessMimeByExt(filename) {
  const ext = path.extname(filename || "").toLowerCase();
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

/**
 * Stream file from uploads.
 * @param disposition "inline" (preview) atau "attachment" (download)
 */
export function streamFile(res, absPath, downloadName, disposition = "attachment") {
  const mime = guessMimeByExt(downloadName);

  res.setHeader("Content-Type", mime);
  res.setHeader("Content-Disposition", `${disposition}; filename="${downloadName}"`);
  fs.createReadStream(absPath).pipe(res);
}

export function streamPdf(res, absPath, downloadName) {
  return streamFile(res, absPath, downloadName, "inline");
}
