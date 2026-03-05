import { updateStatusSchema, createAdminSchema } from "../validators/admin.validator.js";
import * as adminService from "../services/admin.service.js";
import * as exportService from "../services/export.service.js";
import * as fileService from "../services/file.service.js";
import * as adminUserService from "../services/adminUser.service.js";

export async function stats(req, res, next) {
  try {
    const data = await adminService.getStats();
    res.json(data);
  } catch (e) {
    next(e);
  }
}

export async function listApplicants(req, res, next) {
  try {
    const search = (req.query.search || "").toString().trim();
    const status = (req.query.status || "").toString().trim().toUpperCase() || "";
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));

    const data = await adminService.listApplicants({
      search: search || "",
      status: status || "",
      page,
      limit
    });

    res.json({ page, limit, ...data });
  } catch (e) {
    next(e);
  }
}

export async function detail(req, res, next) {
  try {
    const data = await adminService.getApplicantDetail(req.params.id);
    res.json(data);
  } catch (e) {
    next(e);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const body = updateStatusSchema.parse(req.body);
    const updated = await adminService.updateApplicantStatus(req.params.id, body);
    res.json({ message: "Status updated", application: updated });
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

export async function downloadCv(req, res, next) {
  try {
    const data = await adminService.getApplicantDetail(req.params.id);

    const abs = fileService.getUploadAbsPath(data.cvFilename);
    fileService.ensureFileExists(abs);

    fileService.streamFile(res, abs, data.cvFilename, "attachment");
  } catch (e) {
    next(e);
  }
}

export async function downloadIgProof(req, res, next) {
  try {
    const data = await adminService.getApplicantDetail(req.params.id);

    if (!data.igProofFilename) {
      const err = new Error("Bukti follow IG belum diupload");
      err.statusCode = 404;
      throw err;
    }

    const abs = fileService.getUploadAbsPath(data.igProofFilename);
    fileService.ensureFileExists(abs);

    fileService.streamFile(res, abs, data.igProofFilename, "inline");
  } catch (e) {
    next(e);
  }
}

export async function exportExcel(req, res, next) {
  try {
    const status = (req.query.status || "").toString().trim().toUpperCase();
    const wb = await exportService.buildApplicantsWorkbook({ status: status || "" });

    const fileName = status ? `export-${status}.xlsx` : "export-semua.xlsx";
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    await wb.xlsx.write(res);
    res.end();
  } catch (e) {
    next(e);
  }
}

export async function createAdmin(req, res, next) {
  try {
    const body = createAdminSchema.parse(req.body);
    const user = await adminUserService.createAdminUser({
      email: body.email,
      password: body.password,
      role: body.role || "ADMIN"
    });
    res.status(201).json({ message: "Admin created", user });
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


export async function listAdmins(req, res, next) {
  try {
    const users = await adminUserService.listAdminUsers();
    res.json({ data: users });
  } catch (e) {
    next(e);
  }
}

export async function deleteAdmin(req, res, next) {
  try {
    const out = await adminUserService.deleteAdminUser(req.params.id);
    res.json({ message: "Admin deleted", ...out });
  } catch (e) {
    next(e);
  }
}
