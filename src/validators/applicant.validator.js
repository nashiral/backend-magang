import { z } from "zod";

export const applySchema = z.object({
  full_name: z.string().min(2).max(80),
  phone: z.string().min(8).max(20),
  university: z.string().min(2).max(120),
  semester: z.coerce.number().int().min(1).max(20),
  division: z.enum(["HR", "Content Management", "Marketing", "Event Organizer", "Design", "Talent", "Videographer","IT"]),
  declaration: z.coerce.boolean()
});
