import mongoose from "mongoose";

const ApplicantProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    university: { type: String, required: true, trim: true },
    semester: { type: Number, required: true, min: 1, max: 20 }
  },
  { timestamps: true }
);

ApplicantProfileSchema.index({ fullName: "text", university: "text" });

export const ApplicantProfile = mongoose.model("ApplicantProfile", ApplicantProfileSchema);
