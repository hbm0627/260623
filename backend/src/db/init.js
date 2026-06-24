import fs from "node:fs/promises";
import path from "node:path";
import { databasePath, schemaPath } from "./config.js";
import { openDatabase } from "./client.js";

await fs.mkdir(path.dirname(databasePath), { recursive: true });

const db = await openDatabase();

const admin = {
  id: process.env.ADMIN_ID || "admin-1",
  name: process.env.ADMIN_NAME || "Stone Admin",
  email: process.env.ADMIN_EMAIL || "admin@dinocave.local",
  password: process.env.ADMIN_PASSWORD || "Admin!0623",
  bio: process.env.ADMIN_BIO || "동굴 기록을 정리하는 관리자입니다.",
};

try {
  const schema = await fs.readFile(schemaPath, "utf8");
  await db.exec(schema);
  await db.run("ALTER TABLE posts ADD COLUMN image_url TEXT").catch(() => {});
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
      ) VALUES (?, ?, ?, ?, 'admin', ?, 1, datetime('now'), datetime('now'))
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        email = excluded.email,
        password = excluded.password,
        role = 'admin',
        bio = excluded.bio,
        is_active = 1,
        updated_at = datetime('now')
    `,
    admin.id,
    admin.name,
    admin.email,
    admin.password,
    admin.bio,
  );
  await db.run("DELETE FROM post_reactions WHERE post_id = 'post-1'");
  await db.run("DELETE FROM comment_reactions WHERE comment_id IN (SELECT id FROM comments WHERE post_id = 'post-1')");
  await db.run("DELETE FROM comments WHERE post_id = 'post-1'");
  await db.run("DELETE FROM posts WHERE id = 'post-1'");
  console.log(`SQLite database ready: ${databasePath}`);
  console.log(`Admin account migrated: ${admin.email}`);
} finally {
  await db.close();
}
