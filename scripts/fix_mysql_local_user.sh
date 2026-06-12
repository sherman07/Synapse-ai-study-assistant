#!/usr/bin/env bash
set -euo pipefail

SCRIPT_PATH="${BASH_SOURCE[0]:-$0}"
PROJECT_ROOT="$(cd "$(dirname "${SCRIPT_PATH}")/.." && pwd)"
SERVER_ENV="${PROJECT_ROOT}/server/.env"
MYSQL_BIN="${MYSQL_BIN:-/usr/local/mysql/bin/mysql}"

if [ ! -x "${MYSQL_BIN}" ]; then
  echo "MySQL client not found at ${MYSQL_BIN}" >&2
  exit 1
fi

if [ ! -f "${SERVER_ENV}" ]; then
  echo "Missing ${SERVER_ENV}. Copy server/.env.example to server/.env first." >&2
  exit 1
fi

read_env_value() {
  python3 - "$SERVER_ENV" "$1" <<'PY'
import sys
from pathlib import Path

env_path = Path(sys.argv[1])
name = sys.argv[2]
for raw_line in env_path.read_text(encoding="utf-8").splitlines():
    line = raw_line.strip()
    if not line or line.startswith("#") or "=" not in line:
        continue
    key, value = line.split("=", 1)
    if key.strip() != name:
        continue
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
        value = value[1:-1]
    print(value, end="")
    break
PY
}

MYSQL_DATABASE="$(read_env_value MYSQL_DATABASE)"
MYSQL_USER="$(read_env_value MYSQL_USER)"
MYSQL_PASSWORD="$(read_env_value MYSQL_PASSWORD)"

MYSQL_DATABASE="${MYSQL_DATABASE:-synapse}"
MYSQL_USER="${MYSQL_USER:-synapse_app}"

if [ -z "${MYSQL_PASSWORD}" ]; then
  echo "MYSQL_PASSWORD is empty in server/.env" >&2
  exit 1
fi

read -r -s -p "MySQL root password: " MYSQL_ROOT_PASSWORD
echo

ROOT_CNF="$(mktemp /tmp/synapse-mysql-root.XXXXXX.cnf)"
SQL_FILE="$(mktemp /tmp/synapse-mysql-grants.XXXXXX.sql)"
cleanup() {
  rm -f "${ROOT_CNF}" "${SQL_FILE}"
}
trap cleanup EXIT
chmod 600 "${ROOT_CNF}" "${SQL_FILE}"

cat > "${ROOT_CNF}" <<EOF
[client]
user=root
password=${MYSQL_ROOT_PASSWORD}
EOF

python3 - "$MYSQL_DATABASE" "$MYSQL_USER" "$MYSQL_PASSWORD" > "${SQL_FILE}" <<'PY'
import re
import sys

database, user, password = sys.argv[1:4]
if not re.fullmatch(r"[A-Za-z0-9_]+", database):
    raise SystemExit("MYSQL_DATABASE may only contain letters, numbers, and underscores.")
if not re.fullmatch(r"[A-Za-z0-9_]+", user):
    raise SystemExit("MYSQL_USER may only contain letters, numbers, and underscores.")

def quote(value: str) -> str:
    return "'" + value.replace("\\", "\\\\").replace("'", "''") + "'"

def ident(value: str) -> str:
    return "`" + value.replace("`", "``") + "`"

for host in ("localhost", "127.0.0.1"):
    print(f"CREATE DATABASE IF NOT EXISTS {ident(database)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
    print(f"CREATE USER IF NOT EXISTS {quote(user)}@{quote(host)} IDENTIFIED BY {quote(password)};")
    print(f"ALTER USER {quote(user)}@{quote(host)} IDENTIFIED BY {quote(password)};")
    print(
        "GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, INDEX, ALTER, REFERENCES "
        f"ON {ident(database)}.* TO {quote(user)}@{quote(host)};"
    )
print("FLUSH PRIVILEGES;")
PY

"${MYSQL_BIN}" --defaults-extra-file="${ROOT_CNF}" --protocol=TCP -h 127.0.0.1 < "${SQL_FILE}"

source "${PROJECT_ROOT}/scripts/use_local_node.sh" >/dev/null
cd "${PROJECT_ROOT}/server"
npm run db:setup
node -e 'import("./src/db/pool.js").then(async ({checkDatabase, closePool}) => { try { const ok = await checkDatabase(); console.log(ok ? "MySQL connection OK" : "MySQL connection failed"); process.exitCode = ok ? 0 : 1; } finally { await closePool(); } })'
