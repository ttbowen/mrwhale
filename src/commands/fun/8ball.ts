import { Command, Message } from 'yamdbf';
import { BotClient } from '../../client/botClient';
import * as responses from '../../data/8ball';

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: '8ball',
            desc: 'A magic 8ball. Tells your fortune.',
            usage: '<prefix>8ball',
            aliases: ['conchshell']
        });
    }

    async action(message: Message): Promise<any> {
        if (message.content.match(/(will\si\s(?:ever)?\s*get\smarried(\?*))/gi))
            return message.channel.send(`:8ball: Maybe someday.`);

        const index = Math.floor(Math.random() * responses.default.length);

        return message.channel.send(`:8ball: ${responses.default[index]}`);
    }
}
