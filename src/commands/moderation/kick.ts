import { Collection, GuildMember, User } from 'discord.js';
import {
    logger,
    Command,
    CommandDecorators,
    Lang,
    Logger,
    Message,
    Middleware,
    ResourceLoader,
    Util
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
        if (this.client.moderation.isLocked(message.guild, user))
            return message.channel.send('That user is already being moderated.');

        if (message.author.id === user.id) return message.channel.send('You cannot kick yourself.');

        this.client.moderation.setLock(message.guild, user);
        try {
            const modRole = await message.guild.storage.settings.get('modrole');
            if (
                (member && member.roles.has(modRole)) ||
                user.id === message.guild.ownerID ||
                user.bot
            ) {
                return message.channel.send('You cannot use this command on this user.');
            }

            if (!member.kickable) return message.channel.send('That user is not kickable.');

            const promptResult: PromptResult = await prompt(
                message,
                'Are you sure you want to kick this user? Yes or No',
                'Yes',
                'No'
            );

            if (promptResult === PromptResult.TIMEOUT)
                return message.channel.send('Command timed out.');

            if (promptResult === PromptResult.FAILURE)
                return message.channel.send('Okay, aborting kick.');

            try {
                user.send(resource('MSG_DM_KICK', { guildName: message.guild.name, reason }));
            } catch {
                this._logger.error(`Failed to send kick DM to ${user.tag}.`);
            }

            const kick: Message = (await message.channel.send(
                `Kicking **${user.tag}**`
            )) as Message;
            try {
                member.kick(reason);
            } catch (err) {
                return kick.edit(`Error occured while kicking **${user.tag}**. Error: ${err}`);
            }
            this._logger.log(`Kicked: ${user.tag} from ${message.guild.name}`);
            return kick.edit(`Successfully kicked **${user.tag}**`);
        } finally {
            this.client.moderation.removeLock(message.guild, user);
        }
    }
}
