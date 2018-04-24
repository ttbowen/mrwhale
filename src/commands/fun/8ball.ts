import { Command, Message } from 'yamdbf';
import { BotClient } from '../../client/botClient';
import * as responses from '../../data/8ball';

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: '8ball',
            desc: 'A magic 8ball. Tells your fortune.',
            usage: '<prefix>8ball',
            aliases: ['conch', 'conchshell', 'magicconch', 'magicconchshell'],
            group: 'fun'
        });
    }

    async action(message: Message): Promise<any> {
        let index = Math.floor(Math.random() * responses.default.length);

        const conchshellMatch = new RegExp(this.aliases.join('|'), 'gi');
        if (message.content.match(conchshellMatch)) {
            const conchShellOverrides = [`I don't think so.`, `Yes.`, `Try asking again.`, `No.`];

            index = Math.floor(Math.random() * conchShellOverrides.length);

            if (message.content.match(/w(?:o|u|ha)t\s(?:do|to|(?:sh|w)ould)[\s\S]*/gi))
                return message.channel.send(':shell: Nothing.');

            if (message.content.match(/(will\si\s(?:ever)?\s*get\smarried(\?*))/gi))
                return message.channel.send(`:shell: Maybe someday.`);

            return message.channel.send(`:shell: ${conchShellOverrides[index]}`);
        }

        return message.channel.send(`:8ball: ${responses.default[index]}`);
    }
}
