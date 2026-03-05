import { Application } from "../models/Application.js";
import { ApplicantProfile } from "../models/ApplicantProfile.js";
import { User } from "../models/User.js";

export async function getStats() {
  const [total, pending, interview, accepted, rejected] = await Promise.all([
    Application.countDocuments({}),
    Application.countDocuments({ status: "PENDING" }),
    Application.countDocuments({ status: "INTERVIEW" }),
    Application.countDocuments({ status: "ACCEPTED" }),
    Application.countDocuments({ status: "REJECTED" })
  ]);
  return { total, pending, interview, accepted, rejected };
}

export async function listApplicants({ search, status, page, limit }) {
  const skip = (page - 1) * limit;
  const match = status ? { status } : {};

  const pipeline = [
    { $match: match },
    { $sort: { submittedAt: -1 } },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },
    {
      $lookup: {
        from: "applicantprofiles",
        localField: "userId",
        foreignField: "userId",
        as: "profile"
      }
    },
    { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } }
  ];

  if (search) {
    const regex = new RegExp(search, "i");
    pipeline.push({
      $match: {
        $or: [{ "user.email": regex }, { "profile.fullName": regex }]
      }
    });
  }

  const countPipeline = [...pipeline, { $count: "count" }];
  const dataPipeline = [
    ...pipeline,
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        _id: 1,
        division: 1,
        status: 1,
        notes: 1,
        submittedAt: 1,
        "user.email": 1,
        "profile.fullName": 1,
        "profile.phone": 1,
        "profile.university": 1,
        "profile.semester": 1
      }
    }
  ];

  const [countRes, rows] = await Promise.all([
    Application.aggregate(countPipeline),
    Application.aggregate(dataPipeline)
  ]);

  const total = countRes?.[0]?.count || 0;

  const data = rows.map((r, idx) => ({
    no: skip + idx + 1,
    applicationId: r._id,
    name: r.profile?.fullName || "-",
    email: r.user?.email || "-",
    phone: r.profile?.phone || "-",
    university: r.profile?.university || "-",
    semester: r.profile?.semester ?? null,
    division: r.division,
    status: r.status,
    submittedAt: r.submittedAt
  }));

  return { total, totalPages: Math.ceil(total / limit), data };
}

export async function getApplicantDetail(applicationId) {
  const app = await Application.findById(applicationId).lean();
  if (!app) {
    const err = new Error("Not found");
    err.statusCode = 404;
    throw err;
  }

  const [user, profile] = await Promise.all([
    User.findById(app.userId).select("email").lean(),
    ApplicantProfile.findOne({ userId: app.userId }).lean()
  ]);

  return {
    applicationId: app._id,
    status: app.status,
    notes: app.notes,
    division: app.division,
    submittedAt: app.submittedAt,
    applicant: {
      name: profile?.fullName || "-",
      email: user?.email || "-",
      phone: profile?.phone || "-",
      university: profile?.university || "-",
      semester: profile?.semester ?? null
    },
    cvFilename: app.cvPath,
    igProofFilename: app.igProofPath || null
  };
}

export async function updateApplicantStatus(applicationId, { status, notes }) {
  const updated = await Application.findByIdAndUpdate(
    applicationId,
    { status, notes: notes ?? null },
    { new: true }
  ).lean();

  if (!updated) {
    const err = new Error("Not found");
    err.statusCode = 404;
    throw err;
  }
  return updated;
}
