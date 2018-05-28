import { Search } from './search';

/**
 * Represents track searches.
 */
export type Searches = { [guild: string]: { [user: string]: Search } };
