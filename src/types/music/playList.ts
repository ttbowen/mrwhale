import { Collection, Guild } from 'discord.js';
import { BotClient } from '../../client/botClient';
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
     * @param guildId The guild identifer.
     */
    currentTrack(guildId: string): Track {
        return this._currentTrack.get(guildId);
    }

    /**
     * Destroy a guild's playlist.
     * @param guildId The guild identifer.
     */
    destroy(guildId: string): void {
        this._playList.delete(guildId);
        this._currentTrack.delete(guildId);
    }

    /**
     * Get a guild's playlist.
     * @param guildId The guild identifer.
     */
    get(guildId: string): Track[] {
        return this._playList.get(guildId);
    }

    /**
     * Check if the guild has a playlist.
     * @param guildId The guild identifer.
     */
    exists(guildId: string): boolean {
        return this._playList.has(guildId);
    }

    /**
     * Add a new item to the playlist.
     * or create a new one if none exists.
     * @param guildId The guild identifer.
     * @param track The new playlist item.
     */
    add(guildId: string, track: Track): void {
        if (this._playList.has(guildId)) this._playList.get(guildId).push(track);
        else this._playList.set(guildId, [track]);
    }

    /**
     * Play the next track in playlist.
     * @param guild The guild identifer.
     */
    next(guildId: string): Track {
        const next: Track = this._playList.get(guildId).shift();
        next.isPlaying = true;
        this._currentTrack.set(guildId, next);

        return next;
    }
}
