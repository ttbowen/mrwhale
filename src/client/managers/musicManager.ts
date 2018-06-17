import {
    Collection,
    GuildMember,
    Role,
    StreamDispatcher,
    TextChannel,
    VoiceChannel,
    VoiceConnection
} from 'discord.js';
import { Guild, GuildSettings, GuildStorage, ListenerUtil, Message, Util } from 'yamdbf';
import * as ytdl from 'ytdl-core';

import { PlayList } from '../../music/playList';
import { Track } from '../../music/track';
import { TrackSearch } from '../../music/trackSearch';
import { PlayOptions } from '../../types/music/playOptions';
import { BotClient } from '../botClient';
import { ModerationManager } from './moderationManager';
import { VoiceManager } from './voiceManager';

const { on, once, registerListeners } = ListenerUtil;

/**
 * Manager for music commands.
 */
export class MusicManager {
    readonly voiceManager: VoiceManager;
    readonly trackSearch: TrackSearch;
    readonly streamDispatchers: Collection<string, StreamDispatcher>;
    readonly playList: PlayList;

    /**
     * Creates an instance of {@link MusicManager}.
     * @param client The bot client.
     */
    constructor(private client: BotClient) {
        this.voiceManager = new VoiceManager(this.client);
        this.streamDispatchers = new Collection<string, StreamDispatcher>();
        this.playList = new PlayList();
        this.trackSearch = new TrackSearch(this.client);
        registerListeners(this.client, this);
    }

    /**
     * Set the stream volume.
     * @param guildId The guild to set the volume for.
     * @param volume The volume percentage.
     */
    setVolume(guildId: string, volume: number): void {
        this.streamDispatchers.get(guildId).setVolume(Math.max(0, Math.min(1, volume / 100)));
    }

    /**
     * Get the stream volume.
     * @param guildId The guild to get the volume for.
     */
    getVolume(guildId: string): number {
        return Math.floor(this.streamDispatchers.get(guildId).volume * 100);
    }

    /**
     * Play the specified video.
     * @param track The track to play.
     * @param options The play options.
     */
    play(track: Track, options: PlayOptions): void {
        const channel: TextChannel = options.channel;
        const guildId: string = channel.guild.id;
        const streamOption = {
            highWaterMark: 1024 * 1024 * 2,
            quality: 'highestaudio'
        };

        const dispatcher: StreamDispatcher = options.voice.playStream(
            ytdl(track.url, streamOption)
        );
        dispatcher.setVolume(0.5);
        this.playList.setCurrentTrack(guildId, track);

        const dispatchHandler = () => {
            const playlist: Track[] = this.playList.get(guildId);
            this.playList.removeCurrentTrack(guildId);
            this.streamDispatchers.delete(guildId);

            if (this.playList.exists(guildId) && playlist.length > 0) {
                return this.playNext(guildId, options);
            }
        };
        dispatcher.on('error', dispatchHandler);
        dispatcher.on('end', dispatchHandler);
        this.streamDispatchers.set(guildId, dispatcher);
    }

    /**
     * Play the next track in the playlist.
     * @param guildId The guild identifier.
     * @param options Contains the play options.
     */
    playNext(guildId: string, options: PlayOptions): void {
        const channel: TextChannel = options.channel;
        const next: Track = this.playList.next(guildId);

        if (next) this.play(next, options);
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

    /**
     * Checks whether the specified {@link Guild} has set the music role.
     * @param guild The guild to check.
     */
    async hasSetMusicRole(guild: Guild): Promise<boolean> {
        const storage: GuildStorage = this.client.storage.guilds.get(guild.id);
        const hasModRole: boolean = await storage.settings.exists('musicrole');

        return hasModRole && guild.roles.has(await storage.settings.get('musicrole'));
    }

    /**
     * Checks whether the {@link GuildMember} has the music role.
     * @param member The guild member.
     */
    async hasMusicRole(member: GuildMember): Promise<boolean> {
        if (!await this.hasSetMusicRole(member.guild)) return false;
        const storage: GuildStorage = this.client.storage.guilds.get(member.guild.id);

        return member.roles.has(await storage.settings.get('musicrole'));
    }

    /**
     * Checks whether the calling {@link GuildMember} can call a music command.
     * @param message The message which contains the command call.
     */
    async canCallMusicCommand(message: Message): Promise<boolean> {
        const guild: Guild = message.guild;
        const member: GuildMember = message.member;
        const moderation: ModerationManager = this.client.moderation;
        const hasMusicSet: boolean = await this.hasSetMusicRole(guild);
        const hasMusic: boolean = await this.hasMusicRole(message.member);

        if (!guild) return false;
        if (!await moderation.hasSetModRole(guild) && !await this.hasSetMusicRole(guild))
            return false;

        if (!await moderation.hasModRole(member) && !await this.hasMusicRole(member)) return false;

        return true;
    }

    /**
     * Sends error messages for music commands.
     * @param message The message received from command call.
     */
    async error(message: Message): Promise<Message | Message[]> {
        const settings: GuildSettings = await message.guild.storage.settings;
        const guild: Guild = await message.guild;
        const member: GuildMember = await message.member;
        const moderation: ModerationManager = this.client.moderation;
        const roles: Collection<string, Role> = message.guild.roles;
        const prefix: string = await this.client.getPrefix(message.guild);

        const musicName: string = (await this.hasSetMusicRole(guild))
            ? `${roles.get(await settings.get('musicrole')).name}`
            : 'music';
        const modName: string = (await moderation.hasSetModRole(guild))
            ? `${roles.get(await settings.get('modrole')).name}`
            : 'mod';

        if (!message.guild) return await message.channel.send('Command cannot be called from DM.');

        if (!await this.hasSetMusicRole(guild) && !await moderation.hasSetModRole(guild))
            return message.channel.send(`This guild has no music or mod role set.`);

        if (!await this.hasMusicRole(member) && !await moderation.hasModRole(member))
            return message.channel.send(
                `You need the roles \`${musicName}\` or \`${modName}\` to use this command.`
            );
    }

    @on('voiceStateUpdate')
    private _onGuildMemberVoidLeave(oldMember: GuildMember, newMember: GuildMember): void {
        const guildId: string = newMember.guild.id;
        const newMemberChannel: VoiceChannel = newMember.voiceChannel;
        const oldMemberChannel: VoiceChannel = oldMember.voiceChannel;

        if (!newMemberChannel) {
            const skipVoters: Map<
                string,
                GuildMember
            > = this.client.musicPlayer.playList.skipVoters.get(guildId);
            if (skipVoters && skipVoters.has(newMember.id)) skipVoters.delete(newMember.id);
        }
    }
}
