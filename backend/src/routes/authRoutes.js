import { Router } from "express";
import { supabase, throwIfSupabaseError } from "../db/client.js";
import { getUserByEmail, publicUser } from "../db/repository.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { signToken } from "../utils/jwt.js";

export const authRouter = Router();

authRouter.post("/signup", async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "이름, 이메일, 비밀번호는 필수입니다." });
  }

  try {
    const exists = await getUserByEmail(email);
    if (exists) return res.status(409).json({ message: "이미 가입된 이메일입니다." });

    const user = {
      id: `user-${Date.now()}`,
      name,
      email,
      password,
      role: "user",
      bio: "",
      is_active: true,
    };

    const { data, error } = await supabase.from("users").insert(user).select("*").single();
    throwIfSupabaseError(error);

    return res.status(201).json({ user: publicUser(data), token: signToken(data) });
  } catch (error) {
    return next(error);
  }
});

authRouter.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await getUserByEmail(email);

    if (!user || user.password !== password || user.role === "admin" || !user.is_active) {
      return res.status(401).json({ message: "일반 회원 계정으로 로그인해 주세요." });
    }

    return res.json({ user: publicUser(user), token: signToken(user) });
  } catch (error) {
    return next(error);
  }
});

authRouter.post("/admin/login", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await getUserByEmail(email);

    if (!user || user.password !== password || user.role !== "admin" || !user.is_active) {
      return res.status(401).json({ message: "관리자 계정만 접근할 수 있습니다." });
    }

    return res.json({ user: publicUser(user), token: signToken(user) });
  } catch (error) {
    return next(error);
  }
});

authRouter.get("/me", authMiddleware, (req, res) => {
  res.json({ user: publicUser(req.user) });
});
