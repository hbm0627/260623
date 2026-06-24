import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET || "dev-secret";

export function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role, email: user.email }, secret, { expiresIn: "2h" });
}

export function verifyToken(token) {
  return jwt.verify(token, secret);
}
