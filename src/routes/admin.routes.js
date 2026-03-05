import { Router } from "express";
import { authRequired } from "../middlewares/auth.js";
import { requireAnyRole } from "../middlewares/role.js";
import {
  stats,
  listApplicants,
  detail,
  updateStatus,
  downloadCv,
  exportExcel,
  createAdmin,
  downloadIgProof,
  listAdmins,
  deleteAdmin
} from "../controllers/admin.controller.js";

const router = Router();

router.use(authRequired, requireAnyRole(["ADMIN", "SUPER_ADMIN"]));

/** Dashboard */
router.get("/dashboard/stats", stats);

/** Pendaftar */
router.get("/applicants", listApplicants);
router.get("/applicants/:id", detail);
router.put("/applicants/:id/status", updateStatus);

/** CV private */
router.get("/applicants/:id/cv", downloadCv);

/** Bukti follow IG private */
router.get("/applicants/:id/ig-proof", downloadIgProof);

/** Export Excel */
router.get("/export", exportExcel);

/** Create admin (SUPER_ADMIN only) */
router.get("/users", requireAnyRole(["SUPER_ADMIN"]), listAdmins);
router.post("/users", requireAnyRole(["SUPER_ADMIN"]), createAdmin);
router.delete("/users/:id", requireAnyRole(["SUPER_ADMIN"]), deleteAdmin);

export default router;
