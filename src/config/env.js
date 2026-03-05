import dotenv from "dotenv";
dotenv.config();

export const env = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  uploadDir: process.env.UPLOAD_DIR || "uploads",
  superAdminEmail: process.env.SUPERADMIN_EMAIL,
  superAdminPassword: process.env.SUPERADMIN_PASSWORD
};

if (!env.mongoUri) throw new Error("MONGO_URI is required");
if (!env.jwtSecret) throw new Error("JWT_SECRET is required");
