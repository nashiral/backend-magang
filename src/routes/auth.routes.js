import { Router } from "express";
import {
  register,
  login,
  me,
  googleLogin,
  facebookLogin,
  verifyOtp,
  resendOtp,
} from "../controllers/auth.controller.js";
import { authRequired } from "../middlewares/auth.js";
import { authLimiter } from "../middlewares/rateLimit.js";

const router = Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/verify-otp", authLimiter, verifyOtp);
router.post("/resend-otp", authLimiter, resendOtp);

// SOCIAL LOGIN (APPLICANT)
router.post("/google", authLimiter, googleLogin);
router.post("/facebook", authLimiter, facebookLogin);

router.get("/me", authRequired, me);

export default router;