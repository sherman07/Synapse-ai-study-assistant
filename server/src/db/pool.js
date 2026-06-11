import mysql from "mysql2/promise";
import { config } from "../config.js";

let pool = null;

function validateMysqlConfig() {
  const missing = [];
  for (const key of ["host", "database", "user", "password"]) {
    if (!config.mysql[key]) missing.push(`MYSQL_${key.toUpperCase()}`);
  }
  if (!Number.isFinite(config.mysql.port) || config.mysql.port <= 0) missing.push("MYSQL_PORT");
  if (!Number.isFinite(config.mysql.connectionLimit) || config.mysql.connectionLimit <= 0) {
    missing.push("MYSQL_CONNECTION_LIMIT");
  }
  if (missing.length) {
    throw new Error(`MySQL configuration is incomplete: ${missing.join(", ")} required.`);
  }
}

function createPool() {
  if (pool) return pool;
  validateMysqlConfig();
  pool = mysql.createPool({
    host: config.mysql.host,
    port: config.mysql.port,
    database: config.mysql.database,
    user: config.mysql.user,
    password: config.mysql.password,
    waitForConnections: true,
    connectionLimit: config.mysql.connectionLimit,
    namedPlaceholders: false,
    charset: "utf8mb4"
  });
  return pool;
}

async function closePool() {
  if (!pool) return;
  const current = pool;
  pool = null;
  await current.end();
}

async function checkDatabase() {
  const [rows] = await createPool().execute("SELECT 1 AS ok");
  return rows?.[0]?.ok === 1;
}

export { checkDatabase, closePool, createPool };
