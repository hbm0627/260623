import { openDatabase } from "../db/client.js";
import { verifyToken } from "../utils/jwt.js";

function toUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role,
    bio: row.bio,
    isActive: Boolean(row.is_active),
  };
}

export async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "인증 토큰이 필요합니다." });
  }

  let db;

  try {
    const payload = verifyToken(header.slice(7));
    db = await openDatabase();
    const user = toUser(await db.get("SELECT * FROM users WHERE id = ? AND is_active = 1", payload.id));

    if (!user) {
      return res.status(401).json({ message: "유효하지 않은 사용자입니다." });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
  } finally {
    await db?.close();
  }
}
