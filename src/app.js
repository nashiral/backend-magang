import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./routes/auth.routes.js";
import applicantRoutes from "./routes/applicant.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { errorMiddleware } from "./middlewares/error.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/applicant", applicantRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorMiddleware);

export default app;
