// src/controllers/auth.controller.js

import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import * as authService from "../services/auth.service.js";
import { User } from "../models/User.js";
import { ApplicantProfile } from "../models/ApplicantProfile.js";
import { Application } from "../models/Application.js";

import { OAuth2Client } from "google-auth-library";
import axios from "axios";

/* ======================
   NORMAL AUTH (APPLICANT)
====================== */

export async function register(req, res, next) {
  try {
    const body = registerSchema.parse(req.body);
    const result = await authService.registerApplicant(body);
    res.status(201).json(result);
  } catch (e) {
    next(normalizeError(e));
  }
}

export async function login(req, res, next) {
  try {
    const body = loginSchema.parse(req.body);
    const result = await authService.loginUser(body);
    res.json(result);
  } catch (e) {
    next(normalizeError(e));
  }
}

export async function verifyOtp(req, res, next) {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyOTPEmail({ email, otp });
    res.json(result);
  } catch (e) {
    next(normalizeError(e));
  }
}

export async function resendOtp(req, res, next) {
  try {
    const { email } = req.body;
    const result = await authService.resendOTPEmail({ email });
    res.json(result);
  } catch (e) {
    next(normalizeError(e));
  }
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.userId)
      .select("_id email role")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "Not found" });
    }

    const [profile, application] = await Promise.all([
      ApplicantProfile.findOne({ userId: user._id })
        .select("status fullName phone education cvUrl igProofUrl")
        .lean(),
      Application.findOne({ userId: user._id }).lean()
    ]);

    res.json({
      user: {
        ...user,
        profile,
        application
      }
    });
  } catch (e) {
    next(normalizeError(e));
  }
}

/* ======================
   SOCIAL LOGIN (APPLICANT)
====================== */

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function googleLogin(req, res, next) {
  try {
    const { token } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const result = await authService.socialLoginApplicant({
      email: payload.email,
      provider: "google",
    });

    res.json(result);
  } catch (e) {
    e.statusCode = 401;
    e.message = "Google login failed";
    next(e);
  }
}

export async function facebookLogin(req, res, next) {
  try {
    const { accessToken } = req.body;

    const fbRes = await axios.get("https://graph.facebook.com/me", {
      params: {
        fields: "id,name,email",
        access_token: accessToken,
      },
    });

    const result = await authService.socialLoginApplicant({
      email: fbRes.data.email,
      provider: "facebook",
    });

    res.json(result);
  } catch (e) {
    e.statusCode = 401;
    e.message = "Facebook login failed";
    next(e);
  }
}

/* ======================
   ERROR NORMALIZER
====================== */

function normalizeError(e) {
  if (e?.name === "ZodError") {
    const err = new Error(e.issues?.[0]?.message || "Validation error");
    err.statusCode = 400;
    err.details = e.issues;
    return err;
  }
  return e;
}
