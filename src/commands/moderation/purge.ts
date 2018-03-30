import { Collection } from 'discord.js';
import { Command, CommandDecorators, Message, Middleware } from 'yamdbf';
import { BotClient } from '../../client/botClient';
import { moderatorOnly } from '../../util/decorators/moderation';

const { resolve, expect } = Middleware;
const { using } = CommandDecorators;

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'purge',
            desc: 'Remove the last given quantity of messages from channel.',
            info: 'Delete up to 100 messages.',
            usage: '<prefix>purge <quantity>',
            group: 'mod',
            guildOnly: true
        });
    }

    @moderatorOnly
    @using(resolve('quantity: Number'))
    @using(expect('quantity: Number'))
    async action(message: Message, [quantity]: [number]): Promise<any> {
        quantity = Math.trunc(quantity);
        if (!quantity || quantity < 1)
            return message.channel.send('You must pass a valid number of messages to purge.');

        const max = 100;
        const query = {
            limit: Math.min(quantity, max),
            before: message.id
        };
        const messages: Collection<string, Message> = await message.channel.fetchMessages(query);
        message.delete();
        message.channel.bulkDelete(messages);

        return message.channel.send('Successfully purged channel.');
    }
}
