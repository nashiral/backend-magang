import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";

await connectDB(env.mongoUri);

app.listen(env.port, () => {
  console.log(`API running on http://localhost:${env.port}`);
});

app.get("/", (req, res) => {
  res.json({
    message: "Backend Magang API Running",
    status: "success"
  });
});