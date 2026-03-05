import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },

    // untuk local login
    passwordHash: {
      type: String,
      default: null,
    },

    // local | google | facebook
    provider: {
      type: String,
      enum: ["local", "google", "facebook"],
      default: "local",
    },

    role: {
      type: String,
      enum: ["APPLICANT", "ADMIN", "SUPER_ADMIN"],
      default: "APPLICANT",
    },

    // Email verification (OTP)
    isVerified: { type: Boolean, default: false },
    otpHash: { type: String },
    otpExpires: { type: Date },
    otpAttempts: { type: Number, default: 0 },
    otpLastSentAt: { type: Date },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);