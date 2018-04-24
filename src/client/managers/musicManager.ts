import {
    Collection,
    StreamDispatcher,
    TextChannel,
    VoiceChannel,
    VoiceConnection
} from 'discord.js';
import { Guild, Message } from 'yamdbf';
import { PlayList } from '../../types/music/playList';
import { Track } from '../../types/music/track';
import { BotClient } from '../botClient';
import { VoiceManager } from './voiceManager';

import * as ytdl from 'ytdl-core';
import { PlayOptions } from '../../types/music/playOptions';

/**
 * Manager for music commands.
 */
export class MusicManager {
    readonly voiceManager: VoiceManager;
    readonly streamDispatchers: Collection<string, StreamDispatcher>;
    readonly playList: PlayList;

    private _volume: number;

    /**
     * Creates an instance of {@link MusicManager}.
     * @param client The bot client.
     */
    constructor(private client: BotClient) {
        this._volume = 1;
        this.voiceManager = new VoiceManager(this.client);
        this.streamDispatchers = new Collection<string, StreamDispatcher>();
        this.playList = new PlayList();
    }

    /**
     * Play the specified video.
     * @param video The video url to play.
     * @param options The play options.
     */
    async play(video: Track, options: PlayOptions): Promise<void> {
        const channel: TextChannel = options.channel;
        const guildId: string = channel.guild.id;
        const streamOption = {
            highWaterMark: 3145728,
            quality: 'highestaudio'
        };

        const dispatcher = options.voice.playStream(ytdl(video.url, streamOption));
        dispatcher.setVolume(this._volume);
        this.playList.setCurrentTrack(guildId, video);

        const title: string = (await this.getVideoInfo(video.url)).title;
        const msg = (await channel.send(`**Now playing** :notes: \`${title}\``)) as Message;

        dispatcher.on('end', () => {
            this.streamDispatchers.delete(guildId);
            this.playList.removeCurrentTrack(guildId);
            msg.edit(`**Finished playing** :notes: \`${title}\``);

            if (this.playList.exists(guildId) && this.playList.get(guildId).length > 0) {
                return this.playNext(guildId, options);
            } else options.voice.channel.leave();
        });
        this.streamDispatchers.set(guildId, dispatcher);
    }

    /**
     * Play the next track in the playlist.
     * @param guildId The guild identifer.
     * @param options Contains the play options.
     */
    playNext(guildId: string, options: PlayOptions): void {
        const channel: TextChannel = options.channel;
        const next: Track = this.playList.next(guildId);

        if (next) {
            channel.send(`Playing next track in the playlist.`);
            this.play(next, options);
        }
    }

    /**
     * Stop playing audio and leave voice channel.
     * @param connection The voice connection.
     */
    stop(connection: VoiceConnection): void {
        const guildId: string = connection.channel.guild.id;
        if (this.playList.exists(guildId)) this.playList.destroy(guildId);
        if (this.streamDispatchers.has(guildId)) this.streamDispatchers.get(guildId).end();
    }

    /**
     * Pause the currently playing audio.
     * @param connection The voice connection.
     */
    pause(connection: VoiceConnection): void {
        const guildId: string = connection.channel.guild.id;

        if (this.streamDispatchers.has(guildId)) {
            const dispatcher: StreamDispatcher = this.streamDispatchers.get(guildId);
            dispatcher.pause();
        }
    }

    /**
     * Resume the currently playing audio.
     * @param connection The voice connection.
     */
    resume(connection: VoiceConnection): void {
        const guildId: string = connection.channel.guild.id;

        if (this.streamDispatchers.has(guildId)) {
            const dispatcher: StreamDispatcher = this.streamDispatchers.get(guildId);
            dispatcher.resume();
        }
    }

    /**
     * Get information about a video.
     * @param video Video to fetch.
     */
    async getVideoInfo(video: string): Promise<ytdl.videoInfo> {
        let videoInfo: ytdl.videoInfo;

        if (ytdl.validateLink(video)) videoInfo = await ytdl.getInfo(video);

        return videoInfo;
    }
}
