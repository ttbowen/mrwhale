import * as request from 'request-promise';
import { ClientStorage, Command, Message } from 'yamdbf';

import { BotClient } from '../../client/botClient';
import * as memes from '../../data/memes';

const config = require('../../../config.json');

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'meme',
            desc: 'Generate a meme with ImgFlipper.',
            usage: '<prefix>meme <meme>, <toptext>, <bottomtext>',
            group: 'fun',
            argOpts: { separator: ',' }
        });
    }

    async action(
        message: Message,
        [memeName, top, bottom]: [string, string, string]
    ): Promise<any> {
        const storage: ClientStorage = this.client.storage;

        if (!await storage.get('imgflip_user')) storage.set('imgflip_user', config.imgflip_user);
        if (!await storage.get('imgflip_pass')) storage.set('imgflip_pass', config.imgflip_pass);

        memeName = memeName.toLowerCase().trim();
        if (memeName === 'list') {
            let list = '';
            for (const meme in memes.default) {
                list += `${meme}\n`;
            }
            message.author.send({
                embed: { title: 'All available memes', description: list }
            });
            return message.reply('Sent you a DM with list of available memes.');
        }

        if (!memes.default[memeName])
            return message.channel.send(
                'Please pass a valid meme or `list` to get a list of valid memes.'
            );

        const data = {
            template_id: memes.default[memeName],
            username: await storage.get('imgflip_user'),
            password: await storage.get('imgflip_pass'),
            text0: top,
            text1: bottom
        };

        return request
            .post('https://api.imgflip.com/caption_image', { form: data })
            .then(response => {
                const body = JSON.parse(response);
                if (!body.success) return message.channel.send(body.error_message);
                else return message.channel.send(body.data.url);
            });
    }
}
