import { Command, Message } from 'yamdbf';

import { BotClient } from '../../client/botClient';
import * as eyes from '../../data/eyes';

export default class extends Command<BotClient> {
  constructor() {
    super({
      name: 'whale',
      desc: 'Generate a whale face.',
      usage: '<prefix>whale x<number>',
      group: 'fun'
    });
  }

  async action(message: Message, [size]: [string]): Promise<any> {
    const min = 5;
    const max = 50;

    const tooSmall = [
      'You call that a whale?',
      'Hahaha are you even trying?',
      'What is this, a centre for ants!'
    ];

    const tooBig = [
      'I Know whales are huge, but this whale is too huge for me.',
      'This whale is too big for me',
      'Whoa, this will be spam man.',
      'Too big! Abandon ship!'
    ];

    let whaleSize = 5;

    if (size) {
      const match: RegExpExecArray = /x(\d+)/g.exec(size);

      if (match) whaleSize = parseInt(match[1], 10);
    }

    if (whaleSize < min)
      return message.channel.send(tooSmall[Math.floor(Math.random() * tooSmall.length)]);

    if (whaleSize > max)
      return message.channel.send(tooBig[Math.floor(Math.random() * tooBig.length)]);

    let whale = '';
    const whaleEyes = eyes.default[Math.floor(Math.random() * eyes.default.length)];

    whale += whaleEyes[0];
    for (let i = 0; i < whaleSize; i++) {
      whale += '\\_';
    }
    whale += whaleEyes[1];

    return message.channel.send(whale);
  }
}
