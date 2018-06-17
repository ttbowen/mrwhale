import { RichEmbed } from 'discord.js';
import * as request from 'request-promise';
import { Command, Message } from 'yamdbf';

import { BotClient } from '../../client/botClient';

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'google',
            desc: 'Search with Google.',
            usage: '<prefix>google <search>',
            group: 'useful'
        });
    }

    async action(message: Message, args: string[]): Promise<any> {
        const search = args.join(' ');

        if (!search) return message.channel.send('You must pass a search query for this command.');

        const options = {
            url: `https://www.googleapis.com/customsearch/v1`,
            qs: {
                key: await this.client.storage.get('google_api'),
                cx: await this.client.storage.get('google_custom_search_key'),
                q: search.replace(/\s/g, '+'),
                alt: 'json',
                num: 5,
                start: 1
            },
            json: true
        };

        return request(options).then(body => {
            if (!body.items || body.items.length === 0)
                return message.channel.send(`No result for '${search}'`);
            const output = '';
            const colour = 7911109;
            const embed = new RichEmbed();

            for (let i = 0; i < body.items.length; i++) {
                if (body.items[i])
                    embed.addField(`${i + 1}. ${body.items[i].title}`, `${body.items[i].link}`);
            }
            embed.setColor(colour).setAuthor(message.author.username, message.author.avatarURL);

            return message.channel.send({ embed });
        });
    }
}
