import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";
import { config, serverRoot } from "../config.js";

async function applySchema() {
  if (!config.mysql.password) {
    throw new Error("MYSQL_PASSWORD environment variable is required.");
  }
  const schemaPath = path.join(serverRoot, "src", "db", "schema.sql");
  const schema = await fs.readFile(schemaPath, "utf8");
  const connection = await mysql.createConnection({
    host: config.mysql.host,
    port: config.mysql.port,
    database: config.mysql.database,
    user: config.mysql.user,
    password: config.mysql.password,
    multipleStatements: true,
    charset: "utf8mb4"
  });
  try {
    await connection.query(schema);
    console.log(`Synapse MySQL schema is ready in database '${config.mysql.database}'.`);
  } finally {
    await connection.end();
  }
}

applySchema().catch(error => {
  console.error("Could not apply Synapse MySQL schema:", error.message);
  process.exitCode = 1;
});
