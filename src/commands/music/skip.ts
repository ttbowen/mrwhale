import { RichEmbed, StreamDispatcher, VoiceChannel, VoiceConnection } from 'discord.js';
import { Command, Message } from 'yamdbf';
import { BotClient } from '../../client/botClient';

import * as ytdl from 'ytdl-core';
import { Track } from '../../types/music/track';

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'skip',
            desc: 'Skip the current playing track.',
            usage: '<prefix>skip',
            group: 'music',
            guildOnly: true,
            aliases: ['next']
        });
    }

    async action(message: Message): Promise<any> {
        const channel: VoiceChannel = message.member.voiceChannel;
        const guildId: string = message.guild.id;

        if (!channel) return message.channel.send('You need to join a voice channel first.');

        if (this.client.musicPlayer.streamDispatchers.has(guildId)) {
            const current: Track = this.client.musicPlayer.playList.currentTrack(guildId);
            const msg = (await message.channel.send(
                `:fast_forward: Skipping... \`${current.title}\``
            )) as Message;

            this.client.musicPlayer.streamDispatchers.get(guildId).end();

            msg.edit(`:fast_forward: Skipped \`${current.title}\``);
        } else return message.channel.send(`Not currently playing anything.`);
    }
}
