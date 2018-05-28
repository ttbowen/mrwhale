import { Collection, StreamDispatcher, VoiceChannel, VoiceConnection } from 'discord.js';
import { Command, Message } from 'yamdbf';
import { BotClient } from '../../client/botClient';
import { musicRoleOnly } from '../../util/decorators/music';

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'leave',
            desc: 'Leave the current voice channel.',
            usage: '<prefix>leave',
            group: 'music',
            guildOnly: true
        });
    }

    @musicRoleOnly
    async action(message: Message): Promise<any> {
        const channel: VoiceChannel = message.member.voiceChannel;
        const connection: VoiceConnection = this.client.musicPlayer.voiceManager.getGuildConnection(
            message.guild
        );

        if (channel) {
            if (!this.client.musicPlayer.voiceManager.isOnChannel(channel))
                return message.channel.send('You must be in the same channel first.');

            try {
                this.client.musicPlayer.stop(connection);
                connection.channel.leave();
            } catch {
                return message.channel.send('Could not leave this voice channel.');
            }

            return message.channel.send(`Left ${channel.name}.`);
        } else return message.channel.send('You need to join a voice channel first.');
    }
}
