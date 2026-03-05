import { ApplicantProfile } from "../models/ApplicantProfile.js";
import { Application } from "../models/Application.js";
import { User } from "../models/User.js";

export async function getDashboard(userId) {
  const user = await User.findById(userId).select("_id email role").lean();
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  const [profile, application] = await Promise.all([
    ApplicantProfile.findOne({ userId }).lean(),
    Application.findOne({ userId }).lean()
  ]);

  const hasApplied = !!application;

  return {
    email: user.email,
    profileCompleted: !!profile,
    hasApplied,
    applicationStatus: application?.status ?? null,
    division: application?.division ?? null,
    nextAction: hasApplied ? "WAIT_REVIEW" : "FILL_FORM"
  };
}

export async function submitApplication({
  userId,
  payload,
  cvFilename,
  igProofFilename = null
}) {
  if (!userId) {
    const err = new Error("UserId is required");
    err.statusCode = 400;
    throw err;
  }
  if (!cvFilename) {
    const err = new Error("CV file is required");
    err.statusCode = 400;
    throw err;
  }

  const exists = await Application.findOne({ userId }).lean();
  if (exists) {
    const err = new Error("Kamu sudah mengirim pendaftaran.");
    err.statusCode = 409;
    throw err;
  }

  await ApplicantProfile.findOneAndUpdate(
    { userId },
    {
      userId,
      fullName: payload.full_name,
      phone: payload.phone,
      university: payload.university,
      semester: payload.semester
    },
    { upsert: true, new: true }
  );

  const app = await Application.create({
    userId,
    division: payload.division,
    cvPath: cvFilename,                 
    igProofPath: igProofFilename || null, 
    status: "PENDING",
    submittedAt: new Date()
  });

  return { status: app.status, division: app.division };
}
