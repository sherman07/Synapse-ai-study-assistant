import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(serverRoot, ".env") });
dotenv.config();

function envString(name, fallback = "") {
  const value = String(process.env[name] || "").trim();
  return value || fallback;
}

function envInt(name, fallback) {
  const value = Number.parseInt(process.env[name] || "", 10);
  return Number.isFinite(value) ? value : fallback;
}

function envBool(name, fallback = false) {
  const raw = String(process.env[name] || "").trim().toLowerCase();
  if (!raw) return fallback;
  return !["0", "false", "no", "off"].includes(raw);
}

function envList(name, fallback = "") {
  return envString(name, fallback)
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
}

const config = {
  port: envInt("SYNAPSE_DATA_API_PORT", 3001),
  corsOrigins: envList(
    "SYNAPSE_DATA_CORS_ORIGINS",
    "http://127.0.0.1:5173,http://localhost:5173,http://127.0.0.1:5500,http://localhost:5500"
  ),
  allowLocalDemoAuth: envBool("ALLOW_LOCAL_DEMO_AUTH", true),
  internalApiToken: envString("SYNAPSE_INTERNAL_API_TOKEN"),
  supabaseUrl: envString("SUPABASE_URL"),
  supabaseAnonKey: envString("SUPABASE_ANON_KEY"),
  mysql: {
    host: envString("MYSQL_HOST", "127.0.0.1"),
    port: envInt("MYSQL_PORT", 3306),
    database: envString("MYSQL_DATABASE", "synapse"),
    user: envString("MYSQL_USER", "synapse_app"),
    password: envString("MYSQL_PASSWORD"),
    connectionLimit: envInt("MYSQL_CONNECTION_LIMIT", 10)
  }
};

export { config, envBool, envInt, envList, envString, serverRoot };
