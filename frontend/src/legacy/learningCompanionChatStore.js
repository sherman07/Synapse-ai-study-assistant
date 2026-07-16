const CHAT_STORAGE_KEY = "synapse.learning.companion.chat.v1";
const MAX_MESSAGES = 80;
const THREAD_VERSION = 2;
const MAX_CONTEXT_TEXT_LENGTH = 160;
const MAX_CONTEXT_ARRAY_ITEMS = 8;
const MAX_CONTEXT_ARRAY_TEXT_LENGTH = 80;
const MAX_CONTEXT_SERIALIZED_BYTES = 2048;
const CONTEXT_STRING_KEYS = new Set([
  "topic",
  "goal",
  "deadline",
  "student_level",
  "current_level_id",
  "current_session",
  "active_subskill",
  "source_fingerprint",
]);
const CONTEXT_ARRAY_KEYS = new Set(["misconceptions", "review_candidates", "selected_source_ids"]);
const PATH_STRING_KEYS = new Set(["current", "next"]);
const PATH_ARRAY_KEYS = new Set(["steps"]);

function getDefaultNow() {
  return new Date().toISOString();
}

function createThreadId() {
  return globalThis.crypto?.randomUUID?.() || `thread-${Date.now()}`;
}

function normalizeThreadId(id) {
  if (typeof id === "string") {
    return id.trim() || createThreadId();
  }

  if (id === undefined || id === null) {
    return createThreadId();
  }

  const normalized = String(id).trim();
  return normalized || createThreadId();
}

function normalizeContextText(value, maxLength = MAX_CONTEXT_TEXT_LENGTH) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized && normalized.length <= maxLength ? normalized : null;
}

function normalizeContextArray(value) {
  if (!Array.isArray(value)) return null;
  const items = value
    .map(item => normalizeContextText(item, MAX_CONTEXT_ARRAY_TEXT_LENGTH))
    .filter(Boolean)
    .slice(0, MAX_CONTEXT_ARRAY_ITEMS);
  return items.length ? items : null;
}

function normalizeContextPath(path) {
  if (!path || typeof path !== "object" || Array.isArray(path)) return null;
  const normalized = {};
  for (const [key, value] of Object.entries(path)) {
    if (PATH_STRING_KEYS.has(key)) {
      const text = normalizeContextText(value, MAX_CONTEXT_ARRAY_TEXT_LENGTH);
      if (text) normalized[key] = text;
      continue;
    }
    if (PATH_ARRAY_KEYS.has(key)) {
      const items = normalizeContextArray(value);
      if (items) normalized[key] = items;
    }
  }
  return Object.keys(normalized).length ? normalized : null;
}

function normalizeLearningContext(learningContext) {
  if (!learningContext || typeof learningContext !== "object" || Array.isArray(learningContext)) return {};
  const normalized = {};
  for (const [key, value] of Object.entries(learningContext)) {
    if (CONTEXT_STRING_KEYS.has(key)) {
      const text = normalizeContextText(value);
      if (text) normalized[key] = text;
      continue;
    }
    if (key === "permanent_daily_minutes") {
      if (Number.isInteger(value) && value >= 0 && value <= 1440) normalized[key] = value;
      continue;
    }
    if (CONTEXT_ARRAY_KEYS.has(key)) {
      const items = normalizeContextArray(value);
      if (items) normalized[key] = items;
      continue;
    }
    if (key === "path") {
      const path = normalizeContextPath(value);
      if (path) normalized[key] = path;
    }
  }

  while (JSON.stringify(normalized).length > MAX_CONTEXT_SERIALIZED_BYTES) {
    const arrayHolder = Object.entries(normalized)
      .find(([, value]) => Array.isArray(value) && value.length)
      || (normalized.path?.steps?.length ? ["path", normalized.path] : null);
    if (arrayHolder) {
      if (arrayHolder[0] === "path") arrayHolder[1].steps.pop();
      else arrayHolder[1].pop();
      continue;
    }
    const lastKey = Object.keys(normalized).pop();
    if (!lastKey) break;
    delete normalized[lastKey];
  }
  return normalized;
}

function createEmptyThread({ id, now = getDefaultNow } = {}) {
  return {
    version: THREAD_VERSION,
    id: normalizeThreadId(id),
    updatedAt: now(),
    messages: [],
    learningContext: {},
  };
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidMessage(message) {
  if (!message || typeof message !== "object") return false;
  if (!isNonEmptyString(message.id)) return false;
  if (message.role !== "user" && message.role !== "assistant") return false;
  return isNonEmptyString(message.content);
}

function normalizeMessages(messages = []) {
  return messages.filter(isValidMessage).slice(-MAX_MESSAGES);
}

function isValidThread(thread) {
  return (
    thread &&
    typeof thread === "object" &&
    (thread.version === 1 || thread.version === THREAD_VERSION) &&
    isNonEmptyString(thread.id) &&
    isNonEmptyString(thread.updatedAt) &&
    Array.isArray(thread.messages)
  );
}

function readStorageValue(storage, key) {
  try {
    return storage?.getItem ? storage.getItem(key) : storage?.get?.(key) ?? null;
  } catch {
    return null;
  }
}

function writeStorageValue(storage, key, value) {
  try {
    if (storage?.setItem) {
      storage.setItem(key, value);
      return true;
    }
    if (storage?.set) {
      storage.set(key, value);
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

function removeStorageValue(storage, key) {
  try {
    if (storage?.removeItem) {
      storage.removeItem(key);
      return true;
    }
    if (storage?.delete) {
      storage.delete(key);
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

export function createLearningCompanionThread({ id, now = getDefaultNow } = {}) {
  return createEmptyThread({ id, now });
}

export function appendLearningCompanionMessage(thread, message, { now = getDefaultNow } = {}) {
  const base = isValidThread(thread) ? thread : createEmptyThread({ id: thread?.id, now });
  const messages = normalizeMessages([...(base.messages || []), message]);
  return {
    ...base,
    version: THREAD_VERSION,
    messages,
    learningContext: normalizeLearningContext(base.learningContext),
    updatedAt: now(),
  };
}

export function updateLearningCompanionThreadContext(thread, learningContext, { now = getDefaultNow } = {}) {
  const base = isValidThread(thread) ? thread : createEmptyThread({ id: thread?.id, now });
  return {
    ...base,
    version: THREAD_VERSION,
    learningContext: normalizeLearningContext(learningContext),
    updatedAt: now(),
  };
}

export function saveLearningCompanionThread(thread, storage) {
  const safeThread = isValidThread(thread)
    ? {
      ...thread,
      version: THREAD_VERSION,
      messages: normalizeMessages(thread.messages),
      learningContext: normalizeLearningContext(thread.learningContext),
    }
    : createEmptyThread();
  try {
    const payload = JSON.stringify(safeThread);
    return writeStorageValue(storage, CHAT_STORAGE_KEY, payload);
  } catch {
    return false;
  }
}

export function loadLearningCompanionThread(storage) {
  const raw = readStorageValue(storage, CHAT_STORAGE_KEY);
  if (!raw) {
    return createEmptyThread();
  }

  try {
    const parsed = JSON.parse(raw);
    if (!isValidThread(parsed)) {
      return createEmptyThread({ id: parsed?.id });
    }

    return {
      version: THREAD_VERSION,
      id: normalizeThreadId(parsed.id),
      updatedAt: parsed.updatedAt,
      messages: normalizeMessages(parsed.messages),
      learningContext: parsed.version === THREAD_VERSION
        ? normalizeLearningContext(parsed.learningContext)
        : {},
    };
  } catch {
    return createEmptyThread();
  }
}

export function resetLearningCompanionThread({ id, now = getDefaultNow } = {}, storage) {
  const thread = createEmptyThread({ id, now });
  removeStorageValue(storage, CHAT_STORAGE_KEY);
  saveLearningCompanionThread(thread, storage);
  return thread;
}
