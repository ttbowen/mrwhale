import { Collection, GuildMember, User } from 'discord.js';
import { Command, CommandDecorators, Message, Middleware } from 'yamdbf';
import { BotClient } from '../../client/botClient';

const { resolve, expect } = Middleware;
const { using } = CommandDecorators;

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'kick',
            desc: 'Kick a user from the server.',
            usage: '<prefix>kick <user> <...reason>',
            group: 'mod',
            guildOnly: true,
            callerPermissions: ['KICK_MEMBERS']
        });
    }

    @using(resolve('member: Member, ...reason: String'))
    @using(expect('member: Member, ...reason: String'))
    async action(message: Message, [member, reason]: [GuildMember, string]): Promise<any> {
        const user: User = member.user;
        if (message.author.id === user.id) {
            return message.channel.send('You cannot kick yourself.');
        }

        if (user.id === message.guild.ownerID || user.bot) {
            return message.channel.send('You cannot use this command on this user.');
        }

        if (!member.kickable) return message.channel.send('That user is not kickable.');

        const kicking: Message = (await message.channel.send(`banning **${user.tag}**`)) as Message;
        try {
            member.kick(reason);
        } catch (err) {
            return kicking.edit(`Error occured while kicking **${user.tag}**. Error: ${err}`);
        }
        return kicking.edit(`Successfully kicked **${user.tag}**`);
    }
}
