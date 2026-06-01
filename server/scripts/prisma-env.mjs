import { config } from "dotenv";
import { execSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const serverRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(serverRoot, ".env") });

if (!process.env.DATABASE_URL) {
  console.error("Missing DATABASE_URL in server/.env");
  console.error("  cp server/.env.example server/.env");
  console.error("  docker compose up -d postgres");
  process.exit(1);
}

const args = process.argv.slice(2).join(" ") || "migrate deploy";
execSync(`npx prisma ${args}`, { stdio: "inherit", env: process.env, cwd: serverRoot });
