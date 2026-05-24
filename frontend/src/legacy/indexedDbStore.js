class IndexedDbStore {
  constructor(globalScope = globalThis) {
    this.globalScope = globalScope;
  }

  recordKeys(historyId, sourceFingerprint) {
    const keys = [];
    if (historyId) keys.push(`history:${historyId}`);
    if (sourceFingerprint) keys.push(`fingerprint:${sourceFingerprint}`);
    return keys;
  }

  open({ dbName, version, storeName, errorLabel }) {
    return new Promise((resolve, reject) => {
      if (!this.globalScope.indexedDB) {
        reject(new Error("IndexedDB is not available in this browser."));
        return;
      }

      const request = this.globalScope.indexedDB.open(dbName, version);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, { keyPath: "id" });
          store.createIndex("updatedAt", "updatedAt", { unique: false });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        reject(request.error || new Error(`Failed to open ${errorLabel}.`));
      };
    });
  }

  transact(config, mode, callback) {
    return this.open(config).then(db => new Promise((resolve, reject) => {
      const tx = db.transaction(config.storeName, mode);
      const store = tx.objectStore(config.storeName);
      let result;
      try {
        result = callback(store);
      } catch (error) {
        db.close();
        reject(error);
        return;
      }
      tx.oncomplete = () => {
        db.close();
        resolve(result);
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error || new Error(`${config.errorLabel} transaction failed.`));
      };
    }));
  }

  async getRecord(config, key) {
    const db = await this.open(config);
    try {
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(config.storeName, "readonly");
        const request = tx.objectStore(config.storeName).get(key);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } finally {
      db.close();
    }
  }

  async loadFirstItems(config, keys) {
    if (!keys.length) return [];
    try {
      for (const key of keys) {
        const result = await this.getRecord(config, key);
        if (result && Array.isArray(result.items) && result.items.length) {
          return result.items;
        }
      }
    } catch (error) {
      console.warn(`Could not restore ${config.errorLabel}:`, error);
    }
    return [];
  }

  async prune(config, limit, warningLabel) {
    try {
      const db = await this.open(config);
      const tx = db.transaction(config.storeName, "readwrite");
      const store = tx.objectStore(config.storeName);
      const request = store.getAll();
      request.onsuccess = () => {
        const records = Array.isArray(request.result) ? request.result : [];
        const historyRecords = records
          .filter(record => String(record.id || "").startsWith("history:"))
          .sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));
        const keepHistoryIds = new Set(historyRecords.slice(0, limit).map(record => record.id));
        const keepFingerprints = new Set(
          historyRecords
            .slice(0, limit)
            .map(record => record.sourceFingerprint)
            .filter(Boolean)
        );
        records.forEach(record => {
          const id = String(record.id || "");
          if (id.startsWith("history:") && !keepHistoryIds.has(id)) store.delete(id);
          if (id.startsWith("fingerprint:") && !keepFingerprints.has(record.sourceFingerprint)) {
            store.delete(id);
          }
        });
      };
      await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
      db.close();
    } catch (error) {
      console.warn(`${warningLabel} pruning skipped:`, error);
    }
  }
}

const indexedDbStore = new IndexedDbStore();

function cacheRecordKeys(historyId, sourceFingerprint) {
  return indexedDbStore.recordKeys(historyId, sourceFingerprint);
}

function transactCacheStore(config, mode, callback) {
  return indexedDbStore.transact(config, mode, callback);
}

async function loadFirstCacheItems(config, keys) {
  return indexedDbStore.loadFirstItems(config, keys);
}

async function pruneCacheRecords(config, limit, warningLabel) {
  return indexedDbStore.prune(config, limit, warningLabel);
}

export {
  IndexedDbStore,
  cacheRecordKeys,
  indexedDbStore,
  loadFirstCacheItems,
  pruneCacheRecords,
  transactCacheStore
};
