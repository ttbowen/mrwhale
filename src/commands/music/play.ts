import { RichEmbed, TextChannel, VoiceChannel, VoiceConnection } from 'discord.js';
import * as moment from 'moment';
import { Command, Message, Util } from 'yamdbf';
import * as ytdl from 'ytdl-core';

import { BotClient } from '../../client/botClient';
import { Track } from '../../music/track';
import { TrackBuilder } from '../../music/trackBuilder';
import { PlayOptions } from '../../types/music/playOptions';
import { Search } from '../../types/music/search';

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'play',
            desc: 'play an audio stream from YouTube.',
            usage: '<prefix>play <url|search>',
            group: 'music',
            guildOnly: true,
            aliases: ['p', 'yt', 'request']
        });
    }

    private async getTrackSelection(
        message: Message,
        guildId: string,
        memberId: string,
        query: string
    ): Promise<void> {
        const current: Search = Util.getNestedValue(this.client.musicPlayer.trackSearch.searches, [
            guildId,
            memberId
        ]);
        if (current && !current.complete) return;

        try {
            await this.client.musicPlayer.trackSearch.search(message, query);
            const search: Search = Util.getNestedValue(
                this.client.musicPlayer.trackSearch.searches,
                [guildId, memberId]
            );

            let response = '**Please select a track using the `select 1-5` command:**\n';
            for (let i = 0; i < search.results.length; i++) {
                response += `**${i + 1}. **`;
                response += `${search.results[i].title} by ${search.results[i].author}\n`;
            }

            if (search && search.msg) search.msg.edit(response);
        } catch {
            message.channel.send('Could not search this.');
        }
    }

    async action(message: Message, args: string[]): Promise<any> {
        const channel: VoiceChannel = message.member.voiceChannel;
        const guildId: string = message.guild.id;
        const memberId: string = message.member.id;
        const videoOrSearch: string = args.join('');

        if (!channel) return message.channel.send('You need to join a voice channel first.');

        let connection: VoiceConnection;
        if (this.client.musicPlayer.voiceManager.isConnectionOnGuild(message.guild))
            connection = this.client.musicPlayer.voiceManager.getGuildConnection(message.guild);
        else connection = await channel.join();

        if (ytdl.validateLink(videoOrSearch)) {
            const videoInfo: ytdl.videoInfo = await this.client.musicPlayer.getVideoInfo(
                videoOrSearch
            );
            const playOptions: PlayOptions = {
                channel: message.channel as TextChannel,
                voice: connection
            };
            const track: Track = new TrackBuilder()
                .setAuthor(videoInfo.author.name)
                .setDuration(parseInt(videoInfo.length_seconds, 10))
                .setIsPlaying(false)
                .setRequestedBy(message.member)
                .setThumbail(videoInfo.thumbnail_url)
                .setTitle(videoInfo.title)
                .setUrl(videoOrSearch)
                .build();

            if (this.client.musicPlayer.streamDispatchers.has(guildId)) {
                this.client.musicPlayer.playList.add(guildId, track);
                const totalDuration: string = moment
                    .duration(track.duration * 1000)
                    .format('h:mm:ss')
                    .padStart(4, '0:0');
                const embed: RichEmbed = new RichEmbed();
                embed.addField(`Added track to queue`, `**[${track.title}](${track.url})**`);
                embed.addField('By', `${track.author}`, true);
                embed.addField('Track Duration', totalDuration, true);
                embed.setThumbnail(track.thumbnail);

                return message.channel.send({ embed });
            }

            try {
                this.client.musicPlayer.play(track, playOptions);
                return message.channel.send(`**Now playing** :notes: \`${track.title}\``);
            } catch {
                return message.channel.send('Could not play the audio.');
            }
        }
        await this.getTrackSelection(message, guildId, memberId, videoOrSearch);
    }
}
