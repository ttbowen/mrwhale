import { Collection, Guild } from 'discord.js';

import { BotClient } from '../client/botClient';
import { Track } from './track';

/**
 * For storing, retrieving and manipulating a list of tracks on a guild.
 */
export class PlayList {
    private _playList: Collection<string, Track[]>;
    private _currentTrack: Collection<string, Track>;

    constructor() {
        this._playList = new Collection<string, Track[]>();
        this._currentTrack = new Collection<string, Track>();
    }

    /**
     * Get the current playing track.
     * @param guildId The guild identifier.
     */
    getCurrentTrack(guildId: string): Track {
        return this._currentTrack.get(guildId);
    }

    /**
     * Set the current playing track.
     * @param guildId The guild identifier.
     */
    setCurrentTrack(guildId: string, track: Track): void {
        this._currentTrack.set(guildId, track);
    }

    /**
     * Remove the current playing track.
     * @param guildId The guild identifier.
     */
    removeCurrentTrack(guildId: string): void {
        this._currentTrack.delete(guildId);
    }

    /**
     * Destroy a guild's playlist.
     * @param guildId The guild identifier.
     */
    destroy(guildId: string): void {
        this._playList.delete(guildId);
        this._currentTrack.delete(guildId);
    }

    /**
     * Get a guild's playlist.
     * @param guildId The guild identifier.
     */
    get(guildId: string): Track[] {
        return this._playList.get(guildId);
    }

    /**
     * Check if the guild has a playlist.
     * @param guildId The guild identifier.
     */
    exists(guildId: string): boolean {
        return this._playList.has(guildId);
    }

    /**
     * Add a new item to the playlist.
     * or create a new one if none exists.
     * @param guildId The guild identifier.
     * @param track The new playlist item.
     */
    add(guildId: string, track: Track): void {
        if (this._playList.has(guildId)) {
            this._playList.get(guildId).push(track);
        } else this._playList.set(guildId, [track]);
    }

    /**
     * Play the next track in playlist.
     * @param guild The guild identifier.
     */
    next(guildId: string): Track {
        const next: Track = this._playList.get(guildId).shift();
        return next;
    }
}
