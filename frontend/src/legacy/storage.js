class LocalStorageStore {
  constructor(storageProvider = () => globalThis.localStorage) {
    this.storageProvider = storageProvider;
  }

  get storage() {
    return this.storageProvider();
  }

  set(key, value) {
    try {
      this.storage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn(`Could not save ${key} to localStorage:`, error);
      return false;
    }
  }

  get(key, fallback = "") {
    try {
      const value = this.storage.getItem(key);
      return value === null ? fallback : value;
    } catch (error) {
      console.warn(`Could not read ${key} from localStorage:`, error);
      return fallback;
    }
  }

  remove(key) {
    try {
      this.storage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Could not remove ${key} from localStorage:`, error);
      return false;
    }
  }

  readJSON(key, fallback) {
    const raw = this.get(key, "");
    if (!raw) return fallback;
    try {
      const parsed = JSON.parse(raw);
      return parsed === null || parsed === undefined ? fallback : parsed;
    } catch (error) {
      console.warn(`Could not parse ${key} from localStorage:`, error);
      return fallback;
    }
  }

  writeJSON(key, value) {
    try {
      return this.set(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Could not serialize ${key} for localStorage:`, error);
      return false;
    }
  }
}

const localStorageStore = new LocalStorageStore();

function safeSetLocalStorage(key, value) {
  return localStorageStore.set(key, value);
}

function safeGetLocalStorage(key, fallback = "") {
  return localStorageStore.get(key, fallback);
}

function safeRemoveLocalStorage(key) {
  return localStorageStore.remove(key);
}

function safeReadJSONStorage(key, fallback) {
  return localStorageStore.readJSON(key, fallback);
}

function safeWriteJSONStorage(key, value) {
  return localStorageStore.writeJSON(key, value);
}

export {
  LocalStorageStore,
  localStorageStore,
  safeGetLocalStorage,
  safeReadJSONStorage,
  safeRemoveLocalStorage,
  safeSetLocalStorage,
  safeWriteJSONStorage
};
