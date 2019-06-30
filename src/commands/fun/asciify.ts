import * as request from 'request-promise';
import { Command, CommandDecorators, Message, Middleware } from 'yamdbf';

import { BotClient } from '../../client/botClient';
import asciify, * as fontList from '../../data/asciify';

const { resolve, expect } = Middleware;
const { using } = CommandDecorators;

export default class extends Command<BotClient> {
  constructor() {
    super({
      name: 'asciify',
      desc: 'ASCIIfy your text',
      usage: '<prefix>asciify <font index> <text>',
      aliases: ['graffiti'],
      group: 'fun',
      ratelimit: '5/1m'
    });
  }

  @using(resolve('fontID: Number, ...text: String'))
  @using(expect('fontID: Number, ...text: String'))
  async action(message: Message, [fontID, ...text]: [number, string[]]): Promise<any> {
    const fonts: string[] = fontList.default;
    if (fontID >= fonts.length) fontID = fonts.length - 1;
    if (fontID < 0) fontID = 0;

    const textsToAsciify = `${encodeURI(text.join('+'))}`;
    const options = {
      url: 'http://artii.herokuapp.com/make?font=' + fonts[fontID] + '&text=' + textsToAsciify,
      method: 'GET'
    };

    return request(options).then(asciified => {
      message.channel.send('```' + asciified + '```');
    });
  }
}
