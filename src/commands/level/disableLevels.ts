import { TextChannel } from 'discord.js';
import { Command, Message } from 'yamdbf';

import { BotClient } from '../../client/botClient';

export default class extends Command<BotClient> {
  constructor() {
    super({
      name: 'disablelevels',
      desc: 'Disable levelling for server.',
      usage: '<prefix>disablelevels',
      group: 'level',
      aliases: ['disablelvls'],
      guildOnly: true
    });
  }

  async action(message: Message): Promise<any> {
    try {
      const isOwner = this.client.isOwner(message.author);
      const channel = message.channel as TextChannel;

      if (!(isOwner || channel.permissionsFor(message.member).has('MANAGE_GUILD'))) {
        return message.channel.send('You must have permissions to manage the server to use this.');
      }
      message.guild.storage.settings.set('levels', false);
      return message.channel.send('Successfully disabled levels.');
    } catch {
      return message.channel.send('Could not disable levels.');
    }
  }
}
