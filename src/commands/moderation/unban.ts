import { Collection, User } from 'discord.js';
import { logger, Command, CommandDecorators, Logger, Message, Middleware } from 'yamdbf';

import { BotClient } from '../../client/botClient';
import { moderatorOnly } from '../../util/decorators/moderation';
import { prompt, PromptResult } from '../../util/prompt';

const { resolve, expect } = Middleware;
const { using } = CommandDecorators;

export default class extends Command<BotClient> {
    @logger private readonly _logger: Logger;

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
        if (this.client.moderation.isLocked(message.guild, user))
            return message.channel.send('That user is already being moderated.');

        this.client.moderation.setLock(message.guild, user);
        try {
            const bans: Collection<string, User> = await message.guild.fetchBans();
            if (!bans.has(user.id))
                return message.channel.send('This user was not already banned.');

            const promptResult: PromptResult = await prompt(
                message,
                'Are you sure you want to unban this user? Yes or No',
                'Yes',
                'No'
            );

            if (promptResult === PromptResult.TIMEOUT)
                return message.channel.send('Command timed out.');

            if (promptResult === PromptResult.FAILURE)
                return message.channel.send('Okay, aborting unban.');

            const unban: Message = (await message.channel.send(
                `unbanning **${user.tag}**`
            )) as Message;
            try {
                message.guild.unban(user.id);
            } catch (err) {
                this._logger.error(`Error unbanning ${user.tag} from ${message.guild.name}`);
                return unban.edit(`Error occured while unbanning **${user.tag}**. Error: ${err}`);
            }
            this._logger.log(`Unbanned: ${user.tag} from ${message.guild.name}`);
            return unban.edit(`Successfully unbanned **${user.tag}**`);
        } finally {
            this.client.moderation.removeLock(message.guild, user);
        }
    }
}
