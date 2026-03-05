import { applySchema } from "../validators/applicant.validator.js";
import * as applicantService from "../services/applicant.service.js";

export async function dashboard(req, res, next) {
  try {
    const data = await applicantService.getDashboard(req.user.userId);
    res.json(data);
  } catch (e) {
    next(e);
  }
}

export async function apply(req, res, next) {
  try {
    const payload = applySchema.parse(req.body);

    if (!payload.declaration) {
      const err = new Error("Kamu harus mencentang pernyataan kebenaran data.");
      err.statusCode = 400;
      throw err;
    }

    const files = req.files || {};
    const cvFile = files?.cv?.[0] || null;
    const igProofFile = files?.ig_proof?.[0] || null;

    if (!cvFile) {
      const err = new Error("CV PDF wajib diupload (max 5MB).");
      err.statusCode = 400;
      throw err;
    }

    const result = await applicantService.submitApplication({
      userId: req.user.userId,
      payload,
      cvFilename: cvFile.filename,
      igProofFilename: igProofFile ? igProofFile.filename : null
    });

    res.status(201).json({
      message: "Pendaftaran berhasil dikirim",
      ...result
    });
  } catch (e) {
    if (e?.name === "ZodError") {
      const err = new Error(e.issues?.[0]?.message || "Validation error");
      err.statusCode = 400;
      err.details = e.issues;
      return next(err);
    }
    next(e);
  }
}
