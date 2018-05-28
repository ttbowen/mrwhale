import { GuildMember } from 'discord.js';

import { TrackBuilder } from './trackBuilder';

/**
 * Represents a playlist track.
 */
export class Track {
    readonly author: string;
    readonly duration: number;
    readonly isPlaying: boolean;
    readonly requestedBy: GuildMember;
    readonly thumbnail: string;
    readonly title: string;
    readonly url: string;

    /**
     * Creates an instance of {@link Track}.
     * @param builder The track builder.
     */
    constructor(builder: TrackBuilder) {
        this.author = builder.author;
        this.duration = builder.duration;
        this.isPlaying = builder.isPlaying;
        this.requestedBy = builder.requestedBy;
        this.thumbnail = builder.thumbnail;
        this.title = builder.title;
        this.url = builder.url;
    }
}
