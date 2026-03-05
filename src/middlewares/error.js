export function errorMiddleware(err, req, res, next) {
  const message = err?.message || "Internal server error";
  console.error(err);
  res.status(500).json({ message });
}
