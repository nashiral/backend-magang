import { env } from "../config/env.js";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";
import bcrypt from "bcryptjs";

await connectDB(env.mongoUri);

if (!env.superAdminEmail || !env.superAdminPassword) {
  console.error("SUPERADMIN_EMAIL dan SUPERADMIN_PASSWORD wajib diisi di .env");
  process.exit(1);
}

const email = env.superAdminEmail.toLowerCase();
const exists = await User.findOne({ email });

if (exists) {
  console.log("SUPER_ADMIN sudah ada:", email);
  process.exit(0);
}

const passwordHash = await bcrypt.hash(env.superAdminPassword, 10);
await User.create({ email, passwordHash, role: "SUPER_ADMIN" });

console.log("SUPER_ADMIN dibuat:", email);
process.exit(0);
