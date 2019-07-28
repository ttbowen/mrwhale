import * as langs from 'langs';
import * as request from 'request-promise';
import { Command, Message } from 'yamdbf';

import { BotClient } from '../../client/botClient';

export default class extends Command<BotClient> {
  constructor() {
    super({
      name: 'translate',
      desc: 'Translate text to specified language.',
      usage: '<prefix>translate "<text>" to <language>',
      group: 'useful'
    });
  }

  async action(message: Message): Promise<any> {
    const source = 'auto';
    const base = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=';
    let targetLang = 'en';

    const content: string[] = message.content.split('"');
    const textToTranslate: string = content[1];
    let language: string = content[content.length - 1].split('to')[1].trim();

    if (!textToTranslate) message.channel.send('Please pass some text to translate.');

    if (textToTranslate.length > 255) message.channel.send('Sorry but the input is too large.');

    if (language) {
      let name: string;
      language = language.charAt(0).toUpperCase() + language.slice(1);

      if (langs.where('name', language)) {
        name = langs.where('name', language)['1'];
      }
      if (name) targetLang = name;
    }

    const options = {
      url: `${base}${source}&tl=${targetLang}&dt=t&q=${encodeURI(textToTranslate)}`,
      headers: {
        'Content-type': 'text/plain'
      }
    };

    return request(options).then(result => {
      let translated = result.match(/^\[\[\[".+?",/)[0];
      translated = translated.substring(4, translated.length - 2);

      return message.channel.send(`Translated: ${translated}`);
    });
  }
}
