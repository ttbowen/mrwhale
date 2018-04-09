import * as request from 'request-promise';
import { Client, Command, Message } from 'yamdbf';
import { BotClient } from '../../client/botClient';
import { truncate } from '../../util/truncate';

const wiki = require('wikijs').default;

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'wiki',
            desc: 'Search for a Wiki page.',
            usage: '<prefix>wiki <query>',
            group: 'useful'
        });
    }

    async action(message: Message, [query]: [string]): Promise<any> {
        if (!query) return message.channel.send('Please provide a search.');

        const max = 1900;
        wiki()
            .search(query.trim(), 1)
            .then(data => {
                wiki()
                    .page(data.results[0])
                    .then(page => {
                        page.summary().then(info => {
                            const response = `${truncate(max, info)}\n\n<${page.raw.fullurl}>`;

                            return message.channel.send(response);
                        });
                    });
            })
            .catch(() => message.channel.send(`I couldn't search for this wiki.`));
    }
}
