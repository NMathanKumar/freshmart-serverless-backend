export interface CacheStore {
  get<TValue>(key: string): Promise<TValue | null>;
  set<TValue>(key: string, value: TValue, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

export class NoopCacheStore implements CacheStore {
  async get<TValue>(_key: string): Promise<TValue | null> {
    return null;
  }

  async set<TValue>(_key: string, _value: TValue, _ttlSeconds?: number): Promise<void> {}

  async delete(_key: string): Promise<void> {}
}
