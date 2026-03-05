import { Router } from "express";
import { authRequired } from "../middlewares/auth.js";
import { requireAnyRole } from "../middlewares/role.js";
import { uploadApplyFiles } from "../middlewares/upload.js";
import { dashboard, apply } from "../controllers/applicant.controller.js";

const router = Router();

// semua route applicant wajib login + role APPLICANT
router.use(authRequired, requireAnyRole(["APPLICANT"]));

// dashboard applicant
router.get("/dashboard", dashboard);

// submit apply + upload files (cv + bukti ig)
router.post(
  "/apply",
  (req, res, next) => {
    uploadApplyFiles(req, res, (err) => {
      if (err) return next(err);
      return next();
    });
  },
  apply
);

export default router;
