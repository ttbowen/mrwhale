import { GuildMember } from 'discord.js';
import { Guild, GuildSettings, GuildStorage, Message } from 'yamdbf';
import { BotClient } from '../client/botClient';

/**
 * Manager for moderation commands.
 */
export class ModerationManager {
    /**
     * Create an instance of {@link ModerationManager}.
     * @param client The bot client.
     */
    constructor(private client: BotClient) {}

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
        if (!await this.hasSetModRole(message.guild)) return false;
        if (!await this.hasModRole(message.member)) return false;

        return true;
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
