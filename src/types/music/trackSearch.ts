import { Collection } from 'discord.js';
import { Message, Util } from 'yamdbf';
import * as ytdl from 'ytdl-core';

import { BotClient } from '../../client/botClient';
import { YouTube } from '../../music/YouTube';
import { YouTubeVideo } from '../youtube/youtubeVideo';
import { Search } from './search';
import { Searches } from './searches';
import { Track } from './track';
import { TrackBuilder } from './trackBuilder';

/**
 * Search for tracks.
 */
export class TrackSearch {
    private _searches: Searches;

    get searches(): Searches {
        return this._searches;
    }

    /**
     * Creates an instance of {@link TrackSearch}.
     * @param client The bot client.
     */
    constructor(private client: BotClient) {
        this._searches = {};
    }

    /**
     * Search for tracks.
     * @param message The message containing the search.
     * @param search The search terms.
     */
    async search(message: Message, search: string): Promise<void> {
        const guildId: string = message.guild.id;
        const memberId: string = message.member.id;
        const maxResults = 5;
        const tracks: Track[] = [];
        const youtube: YouTube = new YouTube(this.client);
        const msg: Message = (await message.channel.send(
            ':mag_right: Searching for videos with that name...'
        )) as Message;
        const newSearch: Search = {
            complete: false,
            msg: msg,
            terms: search,
            member: message.member,
            results: []
        };

        Util.assignNestedValue(this._searches, [guildId, memberId], newSearch);

        const videos: YouTubeVideo[] = await youtube.search(search, maxResults);
        await this.populate(guildId, memberId, videos);
    }

    private async populate(
        guildId: string,
        memberId: string,
        videos: YouTubeVideo[]
    ): Promise<void> {
        const tracks: Track[] = [];
        const search: Search = Util.getNestedValue(this._searches, [guildId, memberId]);

        for (let i = 0; i < videos.length; i++) {
            const url = `https://www.youtube.com/watch?v=${videos[i].id.videoId}`;
            const videoInfo = await this.client.musicPlayer.getVideoInfo(url);
            const track: Track = new TrackBuilder()
                .setAuthor(videoInfo.author.name)
                .setDuration(parseInt(videoInfo.length_seconds, 10))
                .setIsPlaying(false)
                .setRequestedBy(search.member)
                .setThumbail(videoInfo.thumbnail_url)
                .setTitle(videoInfo.title)
                .setUrl(url)
                .build();
            tracks.push(track);
        }

        search.complete = true;
        search.results = tracks;
        Util.assignNestedValue(this._searches, [guildId, memberId], search);
    }
}
