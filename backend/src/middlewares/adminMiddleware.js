export function adminMiddleware(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "관리자 권한이 필요합니다." });
  }

  return next();
}
