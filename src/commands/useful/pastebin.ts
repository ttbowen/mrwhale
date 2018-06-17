import * as request from 'request-promise';
import { Command, Message } from 'yamdbf';

import { BotClient } from '../../client/botClient';

const config = require('../../../config.json');

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
        if (!await this.client.storage.get('pastebin'))
            this.client.storage.set('pastebin', config.pastebin);

        const paste = args.join(' ');
        if (!paste || paste === '')
            return message.channel.send('Please provide a paste to upload.');

        const options = {
            url: `https://pastebin.com/api/api_post.php`,
            method: 'POST',
            form: {
                api_option: 'paste',
                api_paste_code: paste,
                api_dev_key: await this.client.storage.get('pastebin')
            }
        };

        return request(options).then(body => {
            if (body) return message.channel.send(body);
        });
    }
}
