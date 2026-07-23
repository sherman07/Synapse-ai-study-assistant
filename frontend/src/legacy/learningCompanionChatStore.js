const CHAT_STORAGE_KEY = "synapse.learning.companion.chat.v1";
const THREADS_INDEX_KEY = "synapse.learning.companion.threads.v2";
const MAX_MESSAGES = 80;
const MAX_THREADS = 40;
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
      if (Number.isInteger(value) && value >= 0 && value <= 480) normalized[key] = value;
      continue;
    }
    if (CONTEXT_ARRAY_KEYS.has(key)) {
      const items = normalizeContextArray(value);
      if (items) normalized[key] = items;
      continue;
    }
    if (key === "path_levels") {
      const pathLevels = normalizeContextArray(value);
      if (pathLevels) normalized[key] = pathLevels;
    }
  }

  while (JSON.stringify(normalized).length > MAX_CONTEXT_SERIALIZED_BYTES) {
    const arrayHolder = Object.entries(normalized)
      .find(([, value]) => Array.isArray(value) && value.length)
      || null;
    if (arrayHolder) {
      arrayHolder[1].pop();
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

function normalizeThread(thread, { now = getDefaultNow } = {}) {
  if (!isValidThread(thread)) {
    return createEmptyThread({ id: thread?.id, now });
  }
  return {
    version: THREAD_VERSION,
    id: normalizeThreadId(thread.id),
    updatedAt: isNonEmptyString(thread.updatedAt) ? thread.updatedAt : now(),
    messages: normalizeMessages(thread.messages),
    learningContext: thread.version === THREAD_VERSION
      ? normalizeLearningContext(thread.learningContext)
      : {},
  };
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

function createEmptyIndex(activeThread, { now = getDefaultNow } = {}) {
  const thread = normalizeThread(activeThread, { now });
  return {
    version: 2,
    activeId: thread.id,
    order: [thread.id],
    threads: { [thread.id]: thread },
  };
}

function parseLegacyActiveThread(storage) {
  const raw = readStorageValue(storage, CHAT_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return isValidThread(parsed) ? normalizeThread(parsed) : null;
  } catch {
    return null;
  }
}

function pruneIndex(index) {
  const threads = { ...(index.threads || {}) };
  let order = Array.isArray(index.order) ? [...index.order] : Object.keys(threads);
  order = order.filter(id => threads[id]);
  Object.keys(threads).forEach(id => {
    if (!order.includes(id)) order.push(id);
  });

  order.sort((a, b) => {
    const aTime = Date.parse(String(threads[a]?.updatedAt || "")) || 0;
    const bTime = Date.parse(String(threads[b]?.updatedAt || "")) || 0;
    return bTime - aTime;
  });

  if (order.length > MAX_THREADS) {
    const keep = new Set(order.slice(0, MAX_THREADS));
    if (index.activeId) keep.add(index.activeId);
    order = order.filter(id => keep.has(id));
    Object.keys(threads).forEach(id => {
      if (!keep.has(id)) delete threads[id];
    });
  }

  const activeId = threads[index.activeId] ? index.activeId : (order[0] || null);
  return {
    version: 2,
    activeId,
    order,
    threads,
  };
}

function loadThreadsIndex(storage, { now = getDefaultNow } = {}) {
  const raw = readStorageValue(storage, THREADS_INDEX_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.version === 2 && parsed.threads) {
        const threads = {};
        Object.entries(parsed.threads).forEach(([id, thread]) => {
          const safe = normalizeThread({ ...thread, id: thread?.id || id }, { now });
          threads[safe.id] = safe;
        });
        return pruneIndex({
          version: 2,
          activeId: parsed.activeId,
          order: Array.isArray(parsed.order) ? parsed.order : Object.keys(threads),
          threads,
        });
      }
    } catch {
      // fall through to legacy migration
    }
  }

  const legacy = parseLegacyActiveThread(storage);
  return createEmptyIndex(legacy || createEmptyThread({ now }), { now });
}

function writeThreadsIndex(index, storage) {
  const pruned = pruneIndex(index);
  const active = pruned.activeId && pruned.threads[pruned.activeId]
    ? pruned.threads[pruned.activeId]
    : createEmptyThread();
  if (!pruned.activeId) {
    pruned.activeId = active.id;
    pruned.threads[active.id] = active;
    pruned.order = [active.id, ...pruned.order.filter(id => id !== active.id)];
  }
  try {
    writeStorageValue(storage, THREADS_INDEX_KEY, JSON.stringify(pruned));
    writeStorageValue(storage, CHAT_STORAGE_KEY, JSON.stringify(active));
    return pruned;
  } catch {
    return null;
  }
}

export function companionHistoryId(threadId) {
  return `companion:${normalizeThreadId(threadId)}`;
}

export function companionThreadHasUserContent(thread) {
  return Boolean(
    thread
    && Array.isArray(thread.messages)
    && thread.messages.some(message => message?.role === "user" && isNonEmptyString(message.content))
  );
}

export function titleFromCompanionThread(thread, { fallback = "Learning companion chat" } = {}) {
  const topic = normalizeContextText(thread?.learningContext?.topic, 58);
  if (topic) return topic;
  const firstUser = (thread?.messages || []).find(message => message?.role === "user" && isNonEmptyString(message.content));
  if (!firstUser) return fallback;
  const cleaned = String(firstUser.content).replace(/\s+/g, " ").trim();
  if (cleaned.length <= 58) return cleaned;
  return `${cleaned.slice(0, 55).trim()}…`;
}

export function createLearningCompanionThread({ id, now = getDefaultNow } = {}) {
  return createEmptyThread({ id, now });
}

export function appendLearningCompanionMessage(thread, message, { now = getDefaultNow } = {}) {
  const base = isValidThread(thread) ? normalizeThread(thread, { now }) : createEmptyThread({ id: thread?.id, now });
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
  const base = isValidThread(thread) ? normalizeThread(thread, { now }) : createEmptyThread({ id: thread?.id, now });
  return {
    ...base,
    version: THREAD_VERSION,
    learningContext: normalizeLearningContext(learningContext),
    updatedAt: now(),
  };
}

export function saveLearningCompanionThread(thread, storage) {
  const safeThread = normalizeThread(thread);
  const index = loadThreadsIndex(storage);
  index.threads[safeThread.id] = safeThread;
  index.activeId = safeThread.id;
  index.order = [safeThread.id, ...index.order.filter(id => id !== safeThread.id)];
  return Boolean(writeThreadsIndex(index, storage));
}

export function loadLearningCompanionThread(storage) {
  const index = loadThreadsIndex(storage);
  if (index.activeId && index.threads[index.activeId]) {
    return index.threads[index.activeId];
  }
  const empty = createEmptyThread();
  writeThreadsIndex(createEmptyIndex(empty), storage);
  return empty;
}

export function listLearningCompanionThreads(storage) {
  const index = loadThreadsIndex(storage);
  return index.order
    .map(id => index.threads[id])
    .filter(Boolean);
}

export function activateLearningCompanionThread(id, storage) {
  const index = loadThreadsIndex(storage);
  const threadId = normalizeThreadId(id);
  if (!index.threads[threadId]) {
    return loadLearningCompanionThread(storage);
  }
  index.activeId = threadId;
  writeThreadsIndex(index, storage);
  return index.threads[threadId];
}

export function startNewLearningCompanionThread(storage, { id, now = getDefaultNow } = {}) {
  const index = loadThreadsIndex(storage);
  const next = createEmptyThread({ id, now });
  index.threads[next.id] = next;
  index.activeId = next.id;
  index.order = [next.id, ...index.order.filter(threadId => threadId !== next.id)];
  writeThreadsIndex(index, storage);
  return next;
}

export function deleteLearningCompanionThread(id, storage) {
  const index = loadThreadsIndex(storage);
  const threadId = normalizeThreadId(id);
  delete index.threads[threadId];
  index.order = index.order.filter(entryId => entryId !== threadId);
  if (index.activeId === threadId) {
    const nextId = index.order[0];
    if (nextId && index.threads[nextId]) {
      index.activeId = nextId;
    } else {
      const empty = createEmptyThread();
      index.threads[empty.id] = empty;
      index.activeId = empty.id;
      index.order = [empty.id];
    }
  }
  writeThreadsIndex(index, storage);
  return loadLearningCompanionThread(storage);
}

export function resetLearningCompanionThread({ id, now = getDefaultNow } = {}, storage) {
  const thread = createEmptyThread({ id, now });
  removeStorageValue(storage, CHAT_STORAGE_KEY);
  removeStorageValue(storage, THREADS_INDEX_KEY);
  saveLearningCompanionThread(thread, storage);
  return thread;
}
