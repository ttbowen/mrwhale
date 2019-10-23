import { Command, Message } from 'yamdbf';

import { BotClient } from '../../client/botClient';

export default class extends Command<BotClient> {
  constructor() {
    super({
      name: 'quote',
      desc: 'Get a quote from the channel.',
      usage: '<prefix>quote',
      group: 'fun'
    });
  }

  async action(message: Message): Promise<any> {
    const beforeId = message.channel.messages.first().id;
    const messages = await message.channel.fetchMessages({ before: beforeId, limit: 100 });
    const prefix = await this.client.getPrefix(message.guild);
    const quote = messages
      .filter(
        msg => !msg.author.bot && !msg.content.startsWith(`${prefix}`) && msg.embeds.length < 1
      )
      .random();

    if (quote) {
      return message.channel.send(
        `> ${quote.content}\n - ${quote.member.displayName} ${quote.createdAt.getFullYear()}`
      );
    } else {
      return message.channel.send(`I Can\'t find anything to quote`);
    }
  }
}
