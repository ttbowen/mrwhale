import { Util } from 'yamdbf';

import { Track } from '../../music/track';
import { TrackSelectionCache } from '../../types/music/trackSelectionCache';

/**
 * Manager for caching track selection lists.
 */
export class TrackCacheManager {
    private _trackSelectionCache: TrackSelectionCache;

    constructor() {
        this._trackSelectionCache = {};
    }

    /**
     * Add a track list to the cache.
     * @param guildId The guild id.
     * @param search The search terms.
     * @param tracks The tracks to cache.
     */
    add(guildId: string, search: string, tracks: Track[]): void {
        Util.assignNestedValue(this._trackSelectionCache, [guildId, search], {
            tracks: tracks,
            expire: setTimeout(() => this.remove(guildId, search), 36e5)
        });
    }

    /**
     * Remove a track list from the cache.
     * @param guildId The guild id.
     * @param search The search terms.
     */
    remove(guildId: string, search: string): void {
        Util.removeNestedValue(this._trackSelectionCache, [guildId, search]);
    }

    /**
     * Get a track list from the cache.
     * @param guildId The guild id.
     * @param search The search terms.
     */
    find(guildId: string, search: string): Track[] {
        const trackCache = Util.getNestedValue(this._trackSelectionCache, [guildId, search]);
        if (trackCache) return trackCache.tracks;
    }
}
