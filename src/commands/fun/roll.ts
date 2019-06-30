import * as d20 from 'd20';
import { Command, Message } from 'yamdbf';

import { BotClient } from '../../client/botClient';

export default class extends Command<BotClient> {
  constructor() {
    super({
      name: 'roll',
      desc: 'Roll one or multiple dice.',
      usage: '<prefix>roll [n sides] or [n dice] d[n sides]',
      group: 'fun',
      argOpts: { separator: ',' }
    });
  }

  async action(message: Message, args: string[]): Promise<any> {
    const max = 20;
    let passed = true;

    if (!args || args.length < 1) return message.channel.send(`You rolled a ${d20.roll('6')}`);

    if (args[0].split('d').length <= 1) {
      return message.channel.send(`You rolled a ${d20.roll(args[0] || '6')}`);
    } else {
      for (let i = 0; i < args.length; i++) {
        const current: number = parseInt(args[i].split('d')[0], 10);
        if (current > max) passed = false;
      }

      if (passed) {
        return message.channel.send(
          `You rolled a ${d20.roll(args.toString().replace(',', '+'), true)}`
        );
      } else return message.channel.send(`You tried to roll too many dice at once.`);
    }
  }
}
