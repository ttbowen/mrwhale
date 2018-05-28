import { Message } from 'yamdbf';

import { GuildMember } from 'discord.js';
import { YouTubeVideo } from '../youtube/youtubeVideo';
import { Track } from './track';

/**
 * Represents a {@link Track} search.
 */
export type Search = {
    complete: boolean;
    terms: string;
    msg: Message;
    member: GuildMember;
    results: Track[];
};
