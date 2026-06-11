#!/usr/bin/env bash

# Source this file to make Node/npm available without a global install:
#   source scripts/use_local_node.sh
#
# The Node archive is stored under .synapse_runtime/, which is ignored by Git.

NODE_VERSION="${NODE_VERSION:-v22.16.0}"
SCRIPT_PATH="${BASH_SOURCE[0]:-$0}"
PROJECT_ROOT="$(cd "$(dirname "${SCRIPT_PATH}")/.." && pwd)"
NODE_ROOT="${PROJECT_ROOT}/.synapse_runtime/node"

case "$(uname -s)" in
  Darwin) NODE_OS="darwin" ;;
  Linux) NODE_OS="linux" ;;
  *) echo "Unsupported OS: $(uname -s)" >&2; return 1 2>/dev/null || exit 1 ;;
esac

case "$(uname -m)" in
  arm64|aarch64) NODE_ARCH="arm64" ;;
  x86_64|amd64) NODE_ARCH="x64" ;;
  *) echo "Unsupported CPU architecture: $(uname -m)" >&2; return 1 2>/dev/null || exit 1 ;;
esac

NODE_DIST="node-${NODE_VERSION}-${NODE_OS}-${NODE_ARCH}"
NODE_DIR="${NODE_ROOT}/${NODE_DIST}"
NODE_TARBALL="${NODE_ROOT}/${NODE_DIST}.tar.xz"
NODE_URL="https://nodejs.org/dist/${NODE_VERSION}/${NODE_DIST}.tar.xz"
NODE_SHASUMS="${NODE_ROOT}/SHASUMS256.txt"
NODE_SHASUMS_URL="https://nodejs.org/dist/${NODE_VERSION}/SHASUMS256.txt"

if [ ! -x "${NODE_DIR}/bin/node" ]; then
  mkdir -p "${NODE_ROOT}"
  echo "Downloading ${NODE_DIST}..."
  if ! curl -fL "${NODE_URL}" -o "${NODE_TARBALL}"; then
    echo "Could not download Node from ${NODE_URL}" >&2
    return 1 2>/dev/null || exit 1
  fi
  if ! curl -fL "${NODE_SHASUMS_URL}" -o "${NODE_SHASUMS}"; then
    echo "Could not download Node checksums from ${NODE_SHASUMS_URL}" >&2
    return 1 2>/dev/null || exit 1
  fi
  EXPECTED_SHA="$(awk -v file="$(basename "${NODE_TARBALL}")" '$2 == file { print $1; exit }' "${NODE_SHASUMS}")"
  if [ -z "${EXPECTED_SHA}" ]; then
    echo "Could not find checksum for ${NODE_DIST}.tar.xz" >&2
    return 1 2>/dev/null || exit 1
  fi
  if command -v sha256sum >/dev/null 2>&1; then
    ACTUAL_SHA="$(sha256sum "${NODE_TARBALL}" | awk '{ print $1 }')"
  elif command -v shasum >/dev/null 2>&1; then
    ACTUAL_SHA="$(shasum -a 256 "${NODE_TARBALL}" | awk '{ print $1 }')"
  else
    echo "Could not verify Node download: sha256sum or shasum is required" >&2
    return 1 2>/dev/null || exit 1
  fi
  if [ "${ACTUAL_SHA}" != "${EXPECTED_SHA}" ]; then
    echo "Node download checksum mismatch for ${NODE_TARBALL}" >&2
    return 1 2>/dev/null || exit 1
  fi
  if ! tar -xJf "${NODE_TARBALL}" -C "${NODE_ROOT}"; then
    echo "Could not unpack ${NODE_TARBALL}" >&2
    return 1 2>/dev/null || exit 1
  fi
fi

CURRENT_LINK="${NODE_ROOT}/current"
if [ "$(readlink "${CURRENT_LINK}" 2>/dev/null)" != "${NODE_DIR}" ]; then
  rm -f "${CURRENT_LINK}"
  ln -s "${NODE_DIR}" "${CURRENT_LINK}"
fi
export PATH="${CURRENT_LINK}/bin:${PATH}"

echo "Node ready: $(node --version)"
echo "npm ready: $(npm --version)"
echo "Current shell PATH has been updated."
