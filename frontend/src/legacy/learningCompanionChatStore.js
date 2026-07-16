const CHAT_STORAGE_KEY = "synapse.learning.companion.chat.v1";
const MAX_MESSAGES = 80;

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

function createEmptyThread({ id, now = getDefaultNow } = {}) {
  return {
    version: 1,
    id: normalizeThreadId(id),
    updatedAt: now(),
    messages: [],
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
    thread.version === 1 &&
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
    version: 1,
    messages,
    updatedAt: now(),
  };
}

export function saveLearningCompanionThread(thread, storage) {
  const safeThread = isValidThread(thread) ? { ...thread, messages: normalizeMessages(thread.messages) } : createEmptyThread();
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
      version: 1,
      id: normalizeThreadId(parsed.id),
      updatedAt: parsed.updatedAt,
      messages: normalizeMessages(parsed.messages),
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
