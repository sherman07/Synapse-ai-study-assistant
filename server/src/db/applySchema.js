import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";
import { config, serverRoot } from "../config.js";

const userBillingColumns = [
  { name: "stripe_customer_id", definition: "VARCHAR(255) NULL" },
  { name: "stripe_subscription_id", definition: "VARCHAR(255) NULL" },
  { name: "plan", definition: "VARCHAR(80) NOT NULL DEFAULT 'free'" },
  { name: "subscription_status", definition: "VARCHAR(80) NOT NULL DEFAULT 'inactive'" },
  { name: "current_period_end", definition: "DATETIME(3) NULL" }
];

const userBillingIndexes = [
  { name: "idx_users_stripe_customer", definition: "KEY idx_users_stripe_customer (stripe_customer_id)" },
  { name: "idx_users_stripe_subscription", definition: "KEY idx_users_stripe_subscription (stripe_subscription_id)" },
  { name: "idx_users_plan_status", definition: "KEY idx_users_plan_status (plan, subscription_status)" }
];

async function columnExists(connection, tableName, columnName) {
  const [rows] = await connection.execute(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?
     LIMIT 1`,
    [tableName, columnName]
  );
  return rows.length > 0;
}

async function indexExists(connection, tableName, indexName) {
  const [rows] = await connection.execute(
    `SELECT INDEX_NAME
     FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?
     LIMIT 1`,
    [tableName, indexName]
  );
  return rows.length > 0;
}

async function ensureUserBillingSchema(connection) {
  for (const column of userBillingColumns) {
    if (!(await columnExists(connection, "users", column.name))) {
      await connection.query(`ALTER TABLE users ADD COLUMN ${column.name} ${column.definition}`);
    }
  }

  for (const index of userBillingIndexes) {
    if (!(await indexExists(connection, "users", index.name))) {
      await connection.query(`ALTER TABLE users ADD ${index.definition}`);
    }
  }
}

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
    await ensureUserBillingSchema(connection);
    console.log(`Synapse MySQL schema is ready in database '${config.mysql.database}'.`);
  } finally {
    await connection.end();
  }
}

applySchema().catch(error => {
  console.error("Could not apply Synapse MySQL schema:", error.message);
  process.exitCode = 1;
});
