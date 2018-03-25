import { Collection, GuildMember, User } from 'discord.js';
import { logger, Command, CommandDecorators, Logger, Message, Middleware, Util } from 'yamdbf';
import { BotClient } from '../../client/botClient';
import { moderatorOnly } from '../../util/decorators/moderation';

const { resolve, expect } = Middleware;
const { using } = CommandDecorators;

export default class extends Command<BotClient> {
    @logger private readonly _logger: Logger;

    constructor() {
        super({
            name: 'kick',
            desc: 'Kick a user from the server.',
            usage: '<prefix>kick <user> <...reason>',
            group: 'mod',
            guildOnly: true
        });
    }

    @moderatorOnly
    @using(resolve('member: Member, ...reason: String'))
    @using(expect('member: Member, ...reason: String'))
    async action(message: Message, [member, reason]: [GuildMember, string]): Promise<any> {
        const user: User = member.user;
        if (message.author.id === user.id) {
            return message.channel.send('You cannot kick yourself.');
        }

        const modRole = await message.guild.storage.settings.get('modrole');
        if (
            (member && member.roles.has(modRole)) ||
            user.id === message.guild.ownerID ||
            user.bot
        ) {
            return message.channel.send('You cannot use this command on this user.');
        }

        if (!member.kickable) return message.channel.send('That user is not kickable.');

        const kicking: Message = (await message.channel.send(`Kicking **${user.tag}**`)) as Message;
        try {
            member.kick(reason);
        } catch (err) {
            this._logger.error(`Error while kicking ${user.tag} from ${message.guild.name}`);
            return kicking.edit(`Error occured while kicking **${user.tag}**. Error: ${err}`);
        }
        this._logger.log(`Kicked: ${user.tag} from ${message.guild.name}`);
        return kicking.edit(`Successfully kicked **${user.tag}**`);
    }
}
