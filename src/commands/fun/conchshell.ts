import { Command, Message } from 'yamdbf';

import { BotClient } from '../../client/botClient';

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'conchshell',
            desc: 'A magic conchshell. Tells your fortune.',
            usage: '<prefix>conchshell',
            aliases: ['conch', 'magicconch', 'magicconchshell'],
            group: 'fun'
        });
    }

    async action(message: Message): Promise<any> {
        const conchShellResponses = [`I don't think so.`, `Yes.`, `Try asking again.`, `No.`];
        const index = Math.floor(Math.random() * conchShellResponses.length);

        if (message.content.match(/w(?:o|u|ha)t\s(?:do|to|(?:sh|w)ould)[\s\S]*/gi))
            return message.channel.send(':shell: Nothing.');

        if (message.content.match(/(will\si\s(?:ever)?\s*get\smarried(\?*))/gi))
            return message.channel.send(`:shell: Maybe someday.`);

        return message.channel.send(`:shell: ${conchShellResponses[index]}`);
    }
}
