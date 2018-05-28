import { Message } from 'yamdbf';

import { GuildMember } from 'discord.js';
import { Track } from '../../music/track';
import { YouTubeVideo } from '../youtube/youtubeVideo';

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
