import { Collection, StreamDispatcher, VoiceChannel, VoiceConnection } from 'discord.js';
import { Command, Message } from 'yamdbf';
import * as ytdl from 'ytdl-core';

import { BotClient } from '../../client/botClient';
import { musicRoleOnly } from '../../util/decorators/music';

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'pause',
            desc: 'Pause the current playing track.',
            usage: '<prefix>pause',
            group: 'music',
            guildOnly: true
        });
    }

    @musicRoleOnly
    async action(message: Message): Promise<any> {
        const guildId: string = message.guild.id;
        const dispatchers: Collection<string, StreamDispatcher> = this.client.musicPlayer
            .streamDispatchers;
        const channel: VoiceChannel = message.member.voiceChannel;
        const connection: VoiceConnection = this.client.musicPlayer.voiceManager.getGuildConnection(
            message.guild
        );

        if (dispatchers.has(guildId) && dispatchers.get(guildId).paused)
            return message.channel.send('The player is already paused.');

        if (channel) {
            if (!this.client.musicPlayer.voiceManager.isOnChannel(channel))
                return message.channel.send('You must be in the same channel first.');

            const msg = (await message.channel.send(':pause_button: Pausing...')) as Message;

            try {
                this.client.musicPlayer.pause(connection);
                return msg.edit(':pause_button: Paused.');
            } catch {
                return msg.edit('Could not pause the audio.');
            }
        } else return message.channel.send('You need to join a voice channel first.');
    }
}
