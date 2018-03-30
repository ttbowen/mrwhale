import * as request from 'request-promise';
import { Client, Command, Message } from 'yamdbf';
import { BotClient } from '../../client/BotClient';

export default class extends Command {
    public constructor() {
        super({
            name: 'chucknorris',
            desc: 'Get a random Chuck Norris joke.',
            usage: '<prefix>chucknorris <firstname> <lastname> <category>',
            aliases: ['chuck', 'norris']
        });
    }

    public async action(
        message: Message,
        [firstName, lastName, category]: [string, string, string]
    ): Promise<any> {
        const options = {
            url: `http://api.icndb.com/jokes/random?`,
            method: 'GET',
            qs: {
                escape: 'javascript',
                firstName: firstName,
                lastName: lastName
            },
            headers: {
                'Content-type': 'application/json'
            },
            json: true
        };

        if (category) options.url += `category=[${category}]`;

        return request(options).then(response => {
            if (response.value.joke) return message.channel.send(response.value.joke);
        });
    }
}
