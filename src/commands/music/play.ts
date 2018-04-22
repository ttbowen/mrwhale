import { TextChannel, VoiceChannel, VoiceConnection } from 'discord.js';
import { Command, Message } from 'yamdbf';
import * as ytdl from 'ytdl-core';
import { BotClient } from '../../client/botClient';
import { YouTube } from '../../music/YouTube';
import { Track } from '../../types/music/track';

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'play',
            desc: 'play an audio stream from YouTube.',
            usage: '<prefix>play <url>',
            group: 'music',
            guildOnly: true,
            aliases: ['p', 'yt']
        });
    }

    async action(message: Message, args: string[]): Promise<any> {
        const channel: VoiceChannel = message.member.voiceChannel;
        const guildId: string = message.guild.id;
        let video: string = args.join('');

        if (!channel) return message.channel.send('You need to join a voice channel first.');

        const youtube: YouTube = new YouTube(this.client);

        if (!ytdl.validateLink(video)) {
            const msg = (await message.channel.send(
                ':mag_right: Searching for a video with that name...'
            )) as Message;

            const search = await youtube.search(video);
            if (!search.items || search.items.length === 0)
                return msg.edit('Could not find this video.');

            video = `https://www.youtube.com/watch?v=${search.items[0].id.videoId}`;
        }

        const videoInfo: ytdl.videoInfo = await this.client.musicPlayer.getVideoInfo(video);

        let connection: VoiceConnection;
        if (this.client.musicPlayer.voiceManager.isConnectionOnGuild(message.guild))
            connection = this.client.musicPlayer.voiceManager.getGuildConnection(message.guild);
        else connection = await channel.join();

        const playOptions = {
            channel: message.channel as TextChannel,
            voice: connection
        };

        const track: Track = {
            duration: parseInt(videoInfo.length_seconds, 10),
            requestedBy: message.member,
            title: videoInfo.title,
            url: video,
            isPlaying: false
        };

        if (this.client.musicPlayer.streamDispatchers.has(guildId)) {
            this.client.musicPlayer.playList.add(guildId, track);
            return message.channel.send(`Added \`${track.title}\` to the playlist.`);
        } else this.client.musicPlayer.play(track, playOptions);
    }
}
