export interface AggregationCacheRepository {
  getView<TView>(cacheKey: string): Promise<TView | null>;
  saveView<TView>(cacheKey: string, value: TView): Promise<TView>;
}

export class InMemoryAggregationCacheRepository implements AggregationCacheRepository {
  private readonly store = new Map<string, unknown>();

  async getView<TView>(cacheKey: string): Promise<TView | null> {
    return (this.store.get(cacheKey) as TView | undefined) ?? null;
  }

  async saveView<TView>(cacheKey: string, value: TView): Promise<TView> {
    this.store.set(cacheKey, value);
    return value;
  }
}
