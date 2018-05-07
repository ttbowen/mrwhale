import { Collection, StreamDispatcher, VoiceChannel, VoiceConnection } from 'discord.js';
import { Command, CommandDecorators, Message, Middleware } from 'yamdbf';
import { BotClient } from '../../client/botClient';

const { using } = CommandDecorators;
const { resolve, expect } = Middleware;

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'volume',
            desc: 'Set the volume.',
            usage: '<prefix> volume <value>',
            info: 'The volume can be set between 0 and 100',
            group: 'music',
            guildOnly: true
        });
    }

    @using(resolve('volume: Number'))
    @using(expect('volume: Number'))
    async action(message: Message, [volume]: [number]): Promise<any> {
        const channel: VoiceChannel = message.member.voiceChannel;
        const connection: VoiceConnection = this.client.musicPlayer.voiceManager.getGuildConnection(
            message.guild
        );

        if (channel) {
            if (!this.client.musicPlayer.voiceManager.isOnChannel(channel))
                return message.channel.send('You must be in the same channel first.');

            try {
                if (!this.client.musicPlayer.streamDispatchers.has(message.guild.id))
                    return message.channel.send('There is no audio playing.');

                this.client.musicPlayer.setVolume(message.guild.id, volume);
                return message.channel.send(
                    `Set volume to ${this.client.musicPlayer.getVolume(message.guild.id)}%`
                );
            } catch {
                message.channel.send('Could not set the volume.');
            }
        } else return message.channel.send('You need to join a voice channel first.');
    }
}
