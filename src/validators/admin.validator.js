import { z } from "zod";

export const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "INTERVIEW", "ACCEPTED", "REJECTED"]),
  notes: z.string().max(500).optional().nullable()
});

export const createAdminSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(72),
  role: z.enum(["ADMIN", "SUPER_ADMIN"]).optional()
});
