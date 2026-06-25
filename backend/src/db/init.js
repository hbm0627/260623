import "dotenv/config";
import { supabase, throwIfSupabaseError } from "./client.js";

const admin = {
  id: process.env.ADMIN_ID || "admin-1",
  name: process.env.ADMIN_NAME || "Stone Admin",
  email: process.env.ADMIN_EMAIL || "admin@dinocave.local",
  password: process.env.ADMIN_PASSWORD || "Admin!0623",
  role: "admin",
  bio: process.env.ADMIN_BIO || "동굴 기록을 정리하는 관리자입니다.",
  is_active: true,
  updated_at: new Date().toISOString(),
};

const bucket = process.env.SUPABASE_STORAGE_BUCKET || "media";

const { error: userError } = await supabase.from("users").upsert(admin);
throwIfSupabaseError(userError);

const { data: buckets, error: listError } = await supabase.storage.listBuckets();
throwIfSupabaseError(listError);

if (!buckets.some((item) => item.name === bucket)) {
  const { error: bucketError } = await supabase.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
  });
  throwIfSupabaseError(bucketError);
}

console.log(`Supabase backend ready. Admin account: ${admin.email}`);
console.log(`Supabase storage bucket ready: ${bucket}`);
