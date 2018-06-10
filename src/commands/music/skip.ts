import { VoiceChannel } from 'discord.js';
import { Command, Message } from 'yamdbf';
import * as ytdl from 'ytdl-core';

import { BotClient } from '../../client/botClient';
import { Track } from '../../music/track';

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'skip',
            desc: 'Skip the current playing track.',
            usage: '<prefix>skip',
            group: 'music',
            guildOnly: true,
            aliases: ['next'],
            ratelimit: '3/1m'
        });
    }

    async action(message: Message): Promise<any> {
        const channel: VoiceChannel = message.member.voiceChannel;
        const guildId: string = message.guild.id;

        if (channel) {
            if (!this.client.musicPlayer.voiceManager.isOnChannel(channel))
                return message.channel.send('You must be in the same channel first.');

            if (this.client.musicPlayer.streamDispatchers.has(guildId)) {
                const current: Track = this.client.musicPlayer.playList.getCurrentTrack(guildId);
                const msg = (await message.channel.send(
                    `:fast_forward: Skipping... \`${current.title}\``
                )) as Message;

                try {
                    this.client.musicPlayer.streamDispatchers.get(guildId).end();
                    return msg.edit(`:fast_forward: Skipped \`${current.title}\``);
                } catch {
                    return msg.edit(`Could not skip ${current.title}`);
                }
            } else return message.channel.send(`Not currently playing anything.`);
        } else return message.channel.send('You must join a channel first.');
    }
}
