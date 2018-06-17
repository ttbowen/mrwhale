import { Collection, StreamDispatcher, VoiceChannel, VoiceConnection } from 'discord.js';

import { Command, Message } from 'yamdbf';
import { BotClient } from '../../client/botClient';

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'resume',
            desc: 'Resume the current playing track.',
            usage: '<prefix>resume',
            group: 'music',
            guildOnly: true
        });
    }

    async action(message: Message): Promise<any> {
        const guildId: string = message.guild.id;
        const dispatchers: Collection<string, StreamDispatcher> = this.client.musicPlayer
            .streamDispatchers;
        const channel: VoiceChannel = message.member.voiceChannel;
        const connection: VoiceConnection = this.client.musicPlayer.voiceManager.getGuildConnection(
            message.guild
        );

        if (!dispatchers.get(guildId))
            return message.channel.send('No audio is playing to resume.');

        if (!dispatchers.has(guildId) && dispatchers.get(guildId).paused)
            return message.channel.send('The player is already playing.');

        if (channel) {
            if (!this.client.musicPlayer.voiceManager.isOnChannel(channel))
                return message.channel.send('You must be in the same channel first.');

            const msg = (await message.channel.send(':arrow_forward: Resuming...')) as Message;

            try {
                this.client.musicPlayer.resume(connection);
                return msg.edit(':arrow_forward: Resumed.');
            } catch {
                return msg.edit('Could not resume the audio.');
            }
        } else return message.channel.send('You need to join a voice channel first.');
    }
}
