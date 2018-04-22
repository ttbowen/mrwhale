import { GuildMember } from 'discord.js';

/**
 * Represents a playlist Track.
 */
export interface Track {
    duration: number;
    requestedBy: GuildMember;
    title: string;
    url: string;
    isPlaying: boolean;
}
