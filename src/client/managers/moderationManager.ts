import { GuildMember, User } from 'discord.js';
import { Guild, GuildSettings, GuildStorage, Message, Util } from 'yamdbf';
import { BotClient } from '../../client/botClient';

/**
 * Manager for moderation commands.
 */
export class ModerationManager {
    private _locks: { [guild: string]: { [user: string]: boolean } };
    private _timeouts: { [guild: string]: { [user: string]: NodeJS.Timer } };

    /**
     * Create an instance of {@link ModerationManager}.
     * @param client The bot client.
     * @param actions Moderation actions
     */
    constructor(private client: BotClient) {
        this._locks = {};
        this._timeouts = {};
    }

    /**
     * Checks whether the specified {@link Guild} has set the mod role.
     * @param guild The guild to check.
     */
    async hasSetModRole(guild: Guild): Promise<boolean> {
        const storage: GuildStorage = this.client.storage.guilds.get(guild.id);
        const hasModRole = await storage.settings.exists('modrole');

        return hasModRole && guild.roles.has(await storage.settings.get('modrole'));
    }

    /**
     * Checks whether the {@link GuildMember} has the mod role.
     * @param member The guild member.
     */
    async hasModRole(member: GuildMember): Promise<boolean> {
        if (!await this.hasSetModRole(member.guild)) return false;
        const storage: GuildStorage = this.client.storage.guilds.get(member.guild.id);

        return member.roles.has(await storage.settings.get('modrole'));
    }

    /**
     * Checks whether the calling {@link GuildMember} can call command.
     * @param message The message which contains the command call.
     */
    async canCallCommand(message: Message): Promise<boolean> {
        if (!message.guild) return false;
        if (!await this.hasSetModRole(message.guild)) return false;
        if (!await this.hasModRole(message.member)) return false;

        return true;
    }

    /**
     * Set a lock on moderation action for {@link User}.
     * @param guild The current guild.
     * @param user  The user to set lock for.
     */
    setLock(guild: Guild, user: User): void {
        const timeout = 30000;
        Util.assignNestedValue(this._locks, [guild.id, user.id], true);
        Util.assignNestedValue(
            this._timeouts,
            [guild.id, user.id],
            setTimeout(() => this.removeLock(guild, user), timeout)
        );
    }

    /**
     * Remove locks for {@link User}.
     * @param guild The current guild.
     * @param user The user action is locked to.
     */
    removeLock(guild: Guild, user: User): void {
        Util.removeNestedValue(this._locks, [guild.id, user.id]);
    }

    /**
     * Check if there is a lock on a moderation action for {@link User}.
     * @param guild The current guild.
     * @param user The current user.
     */
    isLocked(guild: Guild, user: User): boolean {
        return Util.getNestedValue(this._locks, [guild.id, user.id]);
    }

    /**
     * Sends error messages for moderation commands.
     * @param message The message received from command call.
     */
    async error(message: Message): Promise<Message | Message[]> {
        const settings: GuildSettings = await message.guild.storage.settings;
        const hasModRole = await message.guild.storage.settings.exists('modrole');
        const modRoleName = hasModRole
            ? `\`${message.guild.roles.get(await settings.get('modrole')).name}\``
            : 'mod';

        if (!message.guild)
            return await message.channel.send('Error: Command cannot be called from DM.');

        if (!await this.hasSetModRole(message.guild))
            return message.channel.send('Error: This guild has no mod role set.');

        if (!await this.hasModRole(message.member))
            return message.channel.send(
                `Error: You need the ${modRoleName} role to use this command.`
            );
    }
}
