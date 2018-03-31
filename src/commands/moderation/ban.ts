import { Collection, GuildMember, User } from 'discord.js';
import {
    logger,
    Command,
    CommandDecorators,
    Lang,
    Logger,
    Message,
    Middleware,
    ResourceLoader
} from 'yamdbf';
import { BotClient } from '../../client/botClient';
import { moderatorOnly } from '../../util/decorators/moderation';
import { prompt, PromptResult } from '../../util/prompt';

const { resolve, expect } = Middleware;
const { using } = CommandDecorators;
const resource: ResourceLoader = Lang.createResourceLoader('en_gb');

export default class extends Command<BotClient> {
    @logger private readonly _logger: Logger;

    constructor() {
        super({
            name: 'ban',
            desc: 'Ban a user from the server.',
            usage: '<prefix>ban <user> <...reason>',
            group: 'mod',
            guildOnly: true
        });
    }

    @moderatorOnly
    @using(resolve('user: User, ...reason: String'))
    @using(expect('user: User, ...reason: String'))
    async action(message: Message, [user, reason]: [User, string]): Promise<any> {
        if (this.client.moderation.isLocked(message.guild, user))
            return message.channel.send('That user is already being moderated.');

        this.client.moderation.setLock(message.guild, user);
        try {
            if (message.author.id === user.id)
                return message.channel.send('You cannot ban yourself.');

            let member: GuildMember;
            try {
                member = await message.guild.fetchMember(user);
            } catch {}

            const modRole = await message.guild.storage.settings.get('modrole');
            if (
                (member && member.roles.has(modRole)) ||
                user.id === message.guild.ownerID ||
                user.bot
            ) {
                return message.channel.send('You cannot use this command on this user.');
            }

            const bans: Collection<string, User> = await message.guild.fetchBans();
            if (bans.has(user.id))
                return message.channel.send('That user is already banned in this server.');

            const promptResult: PromptResult = await prompt(
                message,
                'Are you sure you want to ban this user? Yes or No',
                'Yes',
                'No'
            );

            if (promptResult === PromptResult.TIMEOUT)
                return message.channel.send('Command timed out.');

            if (promptResult === PromptResult.FAILURE)
                return message.channel.send('Okay, aborting ban.');

            try {
                user.send(resource('MSG_DM_BAN', { guildName: message.guild.name, reason }));
            } catch {
                this._logger.error(`Failed to send ban DM to ${user.tag}.`);
            }

            const ban: Message = (await message.channel.send(`Banning **${user.tag}**`)) as Message;
            try {
                message.guild.ban(user, { reason: reason, days: 7 });
            } catch (err) {
                return ban.edit(`Error occured while banning **${user.tag}**. Error: ${err}`);
            }
            this._logger.log(`Banned: ${user.tag} from ${message.guild.name}`);

            return ban.edit(`Successfully banned **${user.tag}**`);
        } finally {
            this.client.moderation.removeLock(message.guild, user);
        }
    }
}
