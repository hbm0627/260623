import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..", "..");

function resolveDatabasePath(value) {
  if (!value) return path.join(backendRoot, "data", "app.sqlite");
  if (path.isAbsolute(value)) return value;
  return path.resolve(backendRoot, value);
}

export const databasePath = resolveDatabasePath(process.env.DATABASE_URL);
export const schemaPath = path.join(__dirname, "schema.sql");
