#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
PID_DIR="${PROJECT_ROOT}/.synapse_runtime/pids"

stop_pid_file() {
  local name="$1"
  local pid_file="${PID_DIR}/${name}.pid"
  if [ ! -f "${pid_file}" ]; then
    return
  fi
  local pid
  pid="$(cat "${pid_file}")"
  if kill -0 "${pid}" >/dev/null 2>&1; then
    kill "${pid}" >/dev/null 2>&1 || true
    sleep 1
    if kill -0 "${pid}" >/dev/null 2>&1; then
      kill -9 "${pid}" >/dev/null 2>&1 || true
    fi
    echo "Stopped ${name} (${pid})"
  fi
  rm -f "${pid_file}"
}

stop_pid_file "frontend"
stop_pid_file "backend"
stop_pid_file "data-api"
