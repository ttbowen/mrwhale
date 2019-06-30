import { StorageProvider, StorageProviderConstructor } from 'yamdbf';

/**
 * In-memory storage provider for testing.
 */
export function TestStorageProvider(): StorageProviderConstructor {
  return class extends StorageProvider {
    private _storage: any;

    constructor() {
      super();
      this._storage = {};
    }

    /**
     * Retrieve value from storage.
     * @param key The key to lookup.
     */
    async get(key: string): Promise<string> {
      return this._storage[key];
    }

    /**
     * Set a value in storage.
     * @param key They key name to set.
     * @param value The value to set.
     */
    async set(key: string, value: string): Promise<void> {
      this._storage[key] = value;
    }
  };
}
