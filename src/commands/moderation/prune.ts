import { GuildMember, User } from 'discord.js';
import { Command, CommandDecorators, Message, Middleware } from 'yamdbf';

import { BotClient } from '../../client/botClient';
import { moderatorOnly } from '../../util/decorators/moderation';

const { resolve, expect } = Middleware;
const { using } = CommandDecorators;

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'prune',
            desc: 'Remove the last messages for provided guild member.',
            info: 'Pass the member and number of messages you want removed.',
            usage: '<prefix>prune <member> <quantity>',
            group: 'mod',
            guildOnly: true
        });
    }

    @moderatorOnly
    @using(resolve('member: Member, quantity: Number'))
    @using(expect('member: Member, quantity: Number'))
    async action(message: Message, [member, quantity]: [GuildMember, number]): Promise<any> {
        if (!member) return message.channel.send('You must mention a valid member to prune.');

        quantity = Math.trunc(quantity);
        if (!quantity || quantity < 1)
            return message.channel.send('You must pass a valid number of messages to prune.');

        const query = {
            limit: 100,
            before: message.id
        };
        const messages: Message[] = (await message.channel.fetchMessages(query))
            .filter((a: Message) => a.author.id === member.id)
            .array();

        messages.length = Math.min(quantity, messages.length);
        if (messages.length < 1) {
            await message.channel.send(
                'There were no messages by that user within the last 100 messages sent.'
            );
        }
        if (messages.length === 1) messages[0].delete();
        else message.channel.bulkDelete(messages);

        if (member.id === message.author.id) message.delete();

        return message.channel.send('Successfully pruned member.');
    }
}
