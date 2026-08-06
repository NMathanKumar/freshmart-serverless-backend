export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const browserStorage = (storage: Storage = window.localStorage): StorageAdapter => ({
  getItem: (key) => storage.getItem(key),
  setItem: (key, value) => storage.setItem(key, value),
  removeItem: (key) => storage.removeItem(key)
});

export const createJsonStorage = <TValue>(storage: StorageAdapter, key: string) => ({
  load: (): TValue | null => {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as TValue) : null;
  },
  save: (value: TValue) => {
    storage.setItem(key, JSON.stringify(value));
  },
  clear: () => {
    storage.removeItem(key);
  }
});
