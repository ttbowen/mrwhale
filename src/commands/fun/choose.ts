import { Command, Message } from 'yamdbf';

import { BotClient } from '../../client/botClient';
import * as decisions from '../../data/choose';

export default class extends Command<BotClient> {
  constructor() {
    super({
      name: 'choose',
      desc: 'Choose between one or multiple choices.',
      usage: '<prefix>choose <choice>, <choice> ...',
      aliases: ['decide', 'pick'],
      argOpts: { separator: ',' },
      group: 'fun'
    });
  }

  private multiDecide(options: string[]): string {
    const selected: string = options[Math.floor(Math.random() * options.length)];
    if (!selected) return this.multiDecide(options);
    return selected;
  }

  async action(message: Message, choices: string[]): Promise<any> {
    if (!choices) return message.channel.send('No choices have been passed.');

    if (choices.length > 1) {
      const index = Math.floor(Math.random() * decisions.default.length);
      const choice = this.multiDecide(choices);

      return message.channel.send(decisions.default[index].replace(/<<CHOICE>>/g, choice));
    } else return message.channel.send('Please pass two or more choices.');
  }
}
