#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
BACKEND_ENV="${PROJECT_ROOT}/backend/.env"

print_port_status() {
  local label="$1"
  local port="$2"
  if lsof -nP -iTCP:"${port}" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "${label}: listening on ${port}"
  else
    echo "${label}: not running"
  fi
}

backend_reports_openai_key() {
  curl --silent --fail --max-time 2 "http://127.0.0.1:8001/health" 2>/dev/null | grep -q '"api_key_loaded":true'
}

print_port_status "Frontend" 5175
print_port_status "Backend" 8001
print_port_status "Data API" 3001

if curl --silent --fail --max-time 2 http://127.0.0.1:8001/health >/dev/null 2>&1; then
  echo "Backend health: OK"
else
  echo "Backend health: unreachable"
fi

if backend_reports_openai_key; then
  echo "Backend OpenAI key: present"
else
  echo "Backend OpenAI key: missing"
fi
