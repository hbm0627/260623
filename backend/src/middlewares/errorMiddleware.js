export function errorMiddleware(error, req, res, next) {
  console.error(error);
  res.status(error.status || 500).json({ message: error.message || "서버 오류가 발생했습니다." });
}
