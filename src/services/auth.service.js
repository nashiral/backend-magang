// src/services/auth.service.js
import { User } from "../models/User.js";
import { hashPassword, comparePassword } from "./hash.service.js";
import { signToken } from "./jwt.service.js";

import crypto from "crypto";
import { sendMailOTP } from "./email.service.js";

function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString(); // 6 digits
}
function hashOTP(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export async function sendOTPToUser(user, { force = false } = {}) {
  // resend cooldown 60s unless force
  if (!force && user.otpLastSentAt && Date.now() - new Date(user.otpLastSentAt).getTime() < 60_000) {
    const err = new Error("Please wait before requesting a new OTP");
    err.statusCode = 429;
    throw err;
  }

  const otp = generateOTP();
  user.otpHash = hashOTP(otp);
  user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
  user.otpAttempts = 0;
  user.otpLastSentAt = new Date();
  await user.save();

  await sendMailOTP(user.email, otp);
}

export async function verifyOTPEmail({ email, otp }) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  if (user.isVerified) return { message: "Already verified" };

  if (user.otpAttempts >= 5) {
    const err = new Error("Too many OTP attempts");
    err.statusCode = 429;
    throw err;
  }
  if (!user.otpExpires || user.otpExpires.getTime() < Date.now()) {
    const err = new Error("OTP expired");
    err.statusCode = 400;
    throw err;
  }

  if (hashOTP(otp) !== user.otpHash) {
    user.otpAttempts += 1;
    await user.save();
    const err = new Error("Invalid OTP");
    err.statusCode = 400;
    throw err;
  }

  user.isVerified = true;
  user.otpHash = null;
  user.otpExpires = null;
  user.otpAttempts = 0;
  await user.save();

  return { message: "Email verified" };
}

export async function resendOTPEmail({ email }) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  if (user.isVerified) {
    const err = new Error("Email already verified");
    err.statusCode = 400;
    throw err;
  }
  await sendOTPToUser(user);
  return { message: "OTP sent" };
}


/**
 * REGISTER APPLICANT (EMAIL + PASSWORD)
 */
export async function registerApplicant({ email, password }) {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    const err = new Error("Email already registered");
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await hashPassword(password);

  const user = await User.create({
    email: email.toLowerCase(),
    passwordHash,
    role: "APPLICANT",
  });

  // Send OTP for email verification
  await sendOTPToUser(user, { force: true });

  return {
    message: "OTP sent to email",
    email: user.email,
  };
}

/**
 * LOGIN EMAIL + PASSWORD
 */
export async function loginUser({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }


  if (user.role === "APPLICANT" && user.isVerified !== true) {
    const err = new Error("Email not verified");
    err.statusCode = 403;
    throw err;
  }

  const token = signToken({
    userId: user._id.toString(),
    role: user.role,
  });

  return {
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    token,
  };
}

/**
 * SOCIAL LOGIN (GOOGLE / FACEBOOK) — APPLICANT ONLY
 */
export async function socialLoginApplicant({ email }) {
  let user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    user = await User.create({
      email: email.toLowerCase(),
      passwordHash: "SOCIAL_LOGIN",
      role: "APPLICANT",
    });
  }

  const token = signToken({
    userId: user._id.toString(),
    role: user.role,
  });

  return {
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    token,
  };
}

