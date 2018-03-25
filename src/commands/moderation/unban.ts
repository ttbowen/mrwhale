import { Collection, User } from 'discord.js';
import { Command, CommandDecorators, Message, Middleware } from 'yamdbf';
import { BotClient } from '../../client/botClient';
import { moderatorOnly } from '../../util/decorators/moderation';

const { resolve, expect } = Middleware;
const { using } = CommandDecorators;

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'unban',
            desc: 'Revoke a server ban.',
            usage: '<prefix>unban <user> <...reason>',
            group: 'mod',
            guildOnly: true
        });
    }

    @moderatorOnly
    @using(resolve('user: User, ...reason: String'))
    @using(expect('user: User, ...reason: String'))
    async action(message: Message, [user, reason]: [User, string]): Promise<any> {
        const bans: Collection<string, User> = await message.guild.fetchBans();
        if (!bans.has(user.id)) {
            return message.channel.send('This user was not already banned.');
        }

        const unbanning: Message = (await message.channel.send(
            `unbanning **${user.tag}**`
        )) as Message;
        try {
            message.guild.unban(user.id);
        } catch (err) {
            return unbanning.edit(`Error occured while unbanning **${user.tag}**. Error: ${err}`);
        }
        return unbanning.edit(`Successfully unbanned **${user.tag}**`);
    }
}
