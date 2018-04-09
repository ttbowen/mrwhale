import { Client, Command, Message } from 'yamdbf';
import { BotClient } from '../../client/botClient';

import * as request from 'request-promise';

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'pastebin',
            desc: 'Upload a paste to pastebin.',
            usage: '<prefix>pastebin <paste>',
            group: 'useful',
            aliases: ['paste', 'pb']
        });
    }

    async action(message: Message, args: string[]): Promise<any> {
        if (!await message.guild.storage.settings.get('pastebin'))
            return message.channel.send('No API key provided for pastebin.');

        const paste = args.join(' ');
        if (!paste || paste === '')
            return message.channel.send('Please provide a paste to upload.');

        const options = {
            url: `https://pastebin.com/api/api_post.php`,
            method: 'POST',
            form: {
                api_option: 'paste',
                api_paste_code: paste,
                api_dev_key: await message.guild.storage.settings.get('pastebin')
            }
        };

        return request(options).then(body => {
            if (body) return message.channel.send(body);
        });
    }
}
