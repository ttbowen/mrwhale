import { RichEmbed } from 'discord.js';
import * as request from 'request-promise';
import * as Wolfram from 'wolfram';
import { Client, Command, Message } from 'yamdbf';

import { BotClient } from '../../client/botClient';

const config = require('../../../config.json');

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'wolfram',
            desc: 'Query wolfram alpha.',
            usage: '<prefix>wolfram <query>',
            group: 'useful'
        });
    }

    private async queryWolfram(query: string): Promise<any> {
        if (!await this.client.storage.get('wolfram_api'))
            this.client.storage.set('wolfram_api', config.wolfram_api);

        const wolfram: Wolfram = Wolfram.createClient(await this.client.storage.get('wolfram_api'));
        return new Promise((resolve, reject) => {
            wolfram.query(query, (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    }

    async action(message: Message, args: string[]): Promise<any> {
        const query = args.join(' ');
        if (!query) return message.channel.send('Please provide a search query.');

        const response = (await message.channel.send(
            'Querying wolfram. Please wait...'
        )) as Message;

        const result = await this.queryWolfram(query);

        if (!result || result.length < 1)
            return message.channel.send('No results found from wolfram alpha.');

        const colour = 7911109;
        const embed = new RichEmbed();

        for (let i = 0; i < result.length; i++) {
            if (result[i].subpods[0] && result[i].title && result[i].subpods[0].value)
                embed.addField(`${result[i].title}`, `${result[i].subpods[0].value}`);
        }
        embed.setColor(colour).setAuthor(message.author.username, message.author.avatarURL);

        response.edit('', { embed: embed });
    }
}
