import * as request from 'request-promise';
import { Client, Command, Message } from 'yamdbf';
import { BotClient } from '../../client/botClient';

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'gif',
            desc: 'Search for gifs on giphy.',
            usage: '<prefix>gif <search>',
            group: 'useful'
        });
    }

    async action(message: Message, args: string[]): Promise<any> {
        const search = args.join(' ');

        if (!search) return message.reply('You must pass a search query for this command.');

        const options = {
            url: `http://api.giphy.com/v1/gifs/random?tag=${encodeURI(search)}`,
            qs: {
                api_key: 'dc6zaTOxFJmzC',
                rating: 'pg-13',
                limit: 1
            },
            json: true
        };

        return request(options)
            .then(body => {
                if (body.data.id) return message.channel.send(body.data.image_original_url);
            })
            .catch(() => {
                return message.channel.send(`An error occured while fetching gif.`);
            });
    }
}
