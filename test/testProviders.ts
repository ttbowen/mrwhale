import { StorageProviderConstructor } from 'yamdbf';

import { TestStorageProvider } from './testStorageProvider';

/**
 * Contains test storage providers.
 */
export class TestProviders {
    static TestStorageProvider: () => StorageProviderConstructor = () => TestStorageProvider();
}
