import { verifyToken } from "../services/jwt.service.js";

export function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ message: "Unauthorized - No token" });
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    console.error("JWT ERROR:", err.name, err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token signature" });
    }

    return res.status(401).json({ message: "Unauthorized" });
  }
}