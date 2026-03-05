import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true, index: true },
    division: { type: String, enum: ["HR", "Content Management", "Marketing", "Event Organizer", "Design", "Talent", "Videographer","IT"], required: true },
    cvPath: { type: String, required: true },
    status: { type: String, enum: ["PENDING", "INTERVIEW", "ACCEPTED", "REJECTED"], default: "PENDING", index: true },
    notes: { type: String, default: null },
    igProofPath: { type: String, default: null },
    submittedAt: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

ApplicationSchema.index({ status: 1, submittedAt: -1 });

export const Application = mongoose.model("Application", ApplicationSchema);
