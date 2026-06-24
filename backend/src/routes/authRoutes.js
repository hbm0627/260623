import { Router } from "express";
import { openDatabase } from "../db/client.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { signToken } from "../utils/jwt.js";

export const authRouter = Router();

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    bio: user.bio,
  };
}

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

authRouter.post("/signup", async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "이름, 이메일, 비밀번호는 필수입니다." });
  }

  const db = await openDatabase();

  try {
    const exists = await db.get("SELECT id FROM users WHERE email = ?", email);
    if (exists) {
      return res.status(409).json({ message: "이미 가입된 이메일입니다." });
    }

    const user = {
      id: `user-${Date.now()}`,
      name,
      email,
      password,
      role: "user",
      bio: "",
      isActive: true,
    };

    await db.run(
      `
        INSERT INTO users (
          id,
          name,
          email,
          password,
          role,
          bio,
          is_active,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, 'user', '', 1, datetime('now'), datetime('now'))
      `,
      user.id,
      user.name,
      user.email,
      user.password,
    );

    return res.status(201).json({ user: publicUser(user), token: signToken(user) });
  } catch (error) {
    return next(error);
  } finally {
    await db.close();
  }
});

authRouter.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  const db = await openDatabase();

  try {
    const user = toUser(
      await db.get(
        "SELECT * FROM users WHERE email = ? AND password = ? AND role != 'admin' AND is_active = 1",
        email,
        password,
      ),
    );

    if (!user) {
      return res.status(401).json({ message: "일반 회원 계정으로 로그인해 주세요." });
    }

    return res.json({ user: publicUser(user), token: signToken(user) });
  } catch (error) {
    return next(error);
  } finally {
    await db.close();
  }
});

authRouter.post("/admin/login", async (req, res, next) => {
  const { email, password } = req.body;
  const db = await openDatabase();

  try {
    const user = toUser(
      await db.get(
        "SELECT * FROM users WHERE email = ? AND password = ? AND role = 'admin' AND is_active = 1",
        email,
        password,
      ),
    );

    if (!user) {
      return res.status(401).json({ message: "관리자 계정만 접근할 수 있습니다." });
    }

    return res.json({ user: publicUser(user), token: signToken(user) });
  } catch (error) {
    return next(error);
  } finally {
    await db.close();
  }
});

authRouter.get("/me", authMiddleware, (req, res) => {
  res.json({ user: publicUser(req.user) });
});
