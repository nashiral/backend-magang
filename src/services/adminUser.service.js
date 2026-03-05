import { User } from "../models/User.js";
import { hashPassword } from "./hash.service.js";

export async function createAdminUser({ email, password, role }) {
  const newRole = role || "ADMIN";

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    const err = new Error("Email already exists");
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({ email: email.toLowerCase(), passwordHash, role: newRole });

  return { id: user._id, email: user.email, role: user.role };
}


export async function listAdminUsers() {
  const users = await User.find({ role: { $in: ["ADMIN", "SUPER_ADMIN"] } })
    .sort({ createdAt: -1 })
    .select("_id email role createdAt");
  return users.map(u => ({
    id: u._id,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt
  }));
}

export async function deleteAdminUser(id) {
  const user = await User.findById(id);
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  if (user.role === "SUPER_ADMIN") {
    const err = new Error("Cannot delete SUPER_ADMIN");
    err.statusCode = 400;
    throw err;
  }
  await User.deleteOne({ _id: id });
  return { id };
}
