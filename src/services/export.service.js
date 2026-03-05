import ExcelJS from "exceljs";
import { Application } from "../models/Application.js";
import { ApplicantProfile } from "../models/ApplicantProfile.js";
import { User } from "../models/User.js";

export async function buildApplicantsWorkbook({ status }) {
  const filter = status ? { status } : {};
  const apps = await Application.find(filter).sort({ submittedAt: -1 }).lean();

  const userIds = apps.map(a => a.userId);
  const [users, profiles] = await Promise.all([
    User.find({ _id: { $in: userIds } }).select("email").lean(),
    ApplicantProfile.find({ userId: { $in: userIds } }).lean()
  ]);

  const userMap = new Map(users.map(u => [String(u._id), u]));
  const profileMap = new Map(profiles.map(p => [String(p.userId), p]));

  const wb = new ExcelJS.Workbook();
  const sh = wb.addWorksheet("Pendaftar");

  sh.columns = [
    { header: "No", key: "no", width: 6 },
    { header: "Nama", key: "name", width: 25 },
    { header: "Email", key: "email", width: 28 },
    { header: "No WhatsApp", key: "phone", width: 18 },
    { header: "Universitas", key: "university", width: 24 },
    { header: "Semester", key: "semester", width: 10 },
    { header: "Divisi", key: "division", width: 12 },
    { header: "Status", key: "status", width: 12 },
    { header: "Waktu Submit", key: "submittedAt", width: 22 },
    { header: "Catatan", key: "notes", width: 30 }
  ];

  apps.forEach((a, i) => {
    const u = userMap.get(String(a.userId));
    const p = profileMap.get(String(a.userId));

    sh.addRow({
      no: i + 1,
      name: p?.fullName || "-",
      email: u?.email || "-",
      phone: p?.phone || "-",
      university: p?.university || "-",
      semester: p?.semester ?? "",
      division: a.division,
      status: a.status,
      submittedAt: new Date(a.submittedAt).toISOString(),
      notes: a.notes || ""
    });
  });

  return wb;
}
