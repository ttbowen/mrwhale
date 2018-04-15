import * as request from 'request-promise';
import { Client, Command, Message } from 'yamdbf';
import { BotClient } from '../../client/botClient';
import { truncate } from '../../util/truncate';

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'define',
            desc: 'Define a word or phrase.',
            usage: '<prefix>define <word>',
            group: 'useful',
            aliases: ['ud', 'def']
        });
    }

    async action(message: Message, args: string[]): Promise<any> {
        const phrase = args.join(' ');

        if (!phrase) return message.channel.send('You must pass word/phrase to define.');

        const options = {
            url: `https://api.urbandictionary.com/v0/define?`,
            qs: {
                page: 1,
                term: phrase
            },
            json: true
        };

        return request(options).then(body => {
            let response = '';
            const defmax = 1500;
            const examplemax = 400;

            if (!body || !body.list || !body.list[0]) response = 'Could not define this.';

            if (body.list[0] && body.list[0].definition)
                response = `**Definition:**\n${truncate(defmax, body.list[0].definition)}\n\n`;

            if (body.list[0] && body.list[0].example)
                response += `**Example:**\n${truncate(examplemax, body.list[0].example)}`;

            return message.channel.send(response);
        });
    }
}
