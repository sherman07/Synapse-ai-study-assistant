function cleanString(value, limit = 5000) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

function nullableString(value, limit = 5000) {
  const cleaned = cleanString(value, limit);
  return cleaned || null;
}

function intValue(value, fallback = 0) {
  const next = Number.parseInt(value, 10);
  return Number.isFinite(next) ? next : fallback;
}

function numberValue(value, fallback = null) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function boolValue(value) {
  return value === true || value === 1 || value === "1" || value === "true";
}

function jsonValue(value, fallback = null) {
  if (value === undefined) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return value ?? fallback;
}

function jsonString(value, fallback = null) {
  return JSON.stringify(value === undefined ? fallback : value);
}

function firstValue(source, keys, fallback = "") {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null) return source[key];
  }
  return fallback;
}

function allowedValue(value, allowed, fallback) {
  const next = cleanString(value, 80).toLowerCase();
  return allowed.includes(next) ? next : fallback;
}

function limitValue(value, fallback = 50, max = 200) {
  return Math.max(1, Math.min(intValue(value, fallback), max));
}

function validateProgressPayload(value) {
  const payload = value === undefined || value === null ? {} : value;
  if (typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, error: "Progress payload must be a JSON object.", value: {} };
  }
  if (
    payload.score !== undefined &&
    payload.score !== null &&
    payload.score !== "" &&
    !Number.isFinite(Number(payload.score))
  ) {
    return { ok: false, error: "Progress score must be a number.", value: {} };
  }
  return { ok: true, value: payload };
}

export {
  allowedValue,
  boolValue,
  cleanString,
  firstValue,
  intValue,
  jsonString,
  jsonValue,
  limitValue,
  nullableString,
  numberValue,
  validateProgressPayload
};
