import { VoiceChannel, VoiceConnection } from 'discord.js';
import { Command, CommandDecorators, Message, Middleware } from 'yamdbf';

import { BotClient } from '../../client/botClient';
import { MusicManager } from '../../client/managers/musicManager';

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
  async action(message: Message, [volume]: [number]): Promise<any> {
    const guildId: string = message.guild.id;
    const channel: VoiceChannel = message.member.voiceChannel;
    const musicPlayer: MusicManager = this.client.musicPlayer;
    const connection: VoiceConnection = this.client.musicPlayer.voiceManager.getGuildConnection(
      message.guild
    );

    if (channel) {
      if (!musicPlayer.voiceManager.isOnChannel(channel))
        return message.channel.send('You must be in the same channel first.');

      if (!musicPlayer.streamDispatchers.has(guildId))
        return message.channel.send('There is no audio playing.');

      try {
        if (!volume) return message.channel.send(`Volume is at ${musicPlayer.getVolume(guildId)}%`);

        musicPlayer.setVolume(guildId, volume);

        return message.channel.send(`Set volume to ${musicPlayer.getVolume(guildId)}%`);
      } catch {
        return message.channel.send('Could not set the volume.');
      }
    } else return message.channel.send('You need to join a voice channel first.');
  }
}
