import { VoiceChannel } from 'discord.js';
import { Command, Message } from 'yamdbf';

import { BotClient } from '../../client/botClient';

export default class extends Command<BotClient> {
  constructor() {
    super({
      name: 'join',
      desc: 'Join the voice channel you are currently in.',
      usage: '<prefix>join',
      group: 'music',
      guildOnly: true
    });
  }

  async action(message: Message): Promise<any> {
    const channel: VoiceChannel = message.member.voiceChannel;

    if (channel) {
      try {
        await channel.join();
        return message.channel.send(`Joined ${channel.name}.`);
      } catch {
        return message.channel.send('Could not join this voice channel.');
      }
    } else return message.channel.send('You need to join a voice channel first.');
  }
}
