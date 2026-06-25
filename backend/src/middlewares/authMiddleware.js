import { getUserById, publicUser } from "../db/repository.js";
import { verifyToken } from "../utils/jwt.js";

export async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "인증 토큰이 필요합니다." });
  }

  try {
    const payload = verifyToken(header.slice(7));
    const user = await getUserById(payload.id);

    if (!user) {
      return res.status(401).json({ message: "유효하지 않은 사용자입니다." });
    }

    req.user = { ...publicUser(user), password: user.password };
    return next();
  } catch {
    return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
  }
}
