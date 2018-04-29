import { GuildChannel, GuildMember, RichEmbed, TextChannel, User } from 'discord.js';
import { Client, Guild, ListenerUtil, LogLevel, Providers } from 'yamdbf';
import { Database } from '../database/database';
import { LevelManager } from './managers/levelManager';
import { ModerationManager } from './managers/moderationManager';
import { MusicManager } from './managers/musicManager';
import { VoiceManager } from './managers/voiceManager';
const { on, once } = ListenerUtil;

const config = require('../../config.json');
const db = require('../../db.json');
const path = require('path');

export class BotClient extends Client {
    private readonly _level: LevelManager;
    private readonly _database: Database;

    readonly moderation: ModerationManager;
    readonly musicPlayer: MusicManager;

    constructor() {
        super({
            token: config.discord_token,
            owner: config.discord_owner,
            ratelimit: '10/1m',
            logLevel: LogLevel.ERROR,
            localeDir: './dist/locale',
            statusText: 'In the Ocean.',
            commandsDir: './dist/commands',
            pause: true,
            provider: Providers.SQLiteProvider(db.settings_db_url)
        });
        this.moderation = new ModerationManager(this);
        this.musicPlayer = new MusicManager(this);
        this._database = Database.instance(db.main_db_url);
        this._level = new LevelManager(this);
    }

    @once('pause')
    private async _onPause(): Promise<void> {
        await this.setDefaultSetting('prefix', config.default_prefix);
        await this.setDefaultSetting('levels', true);
        await this.storage.set('google_api', config.google_api);
        await this.storage.set('google_custom_search_key', config.google_custom_search_key);
        await this.storage.set('youtube_api', config.youtube_api);
        this.continue();
    }

    @once('clientReady')
    private async _onClientReady(): Promise<void> {
        await this._database.init();
    }

    @on('guildCreate')
    private async _onGuildCreate(guild: Guild): Promise<void> {
        const prefix: string = guild.storage
            ? await guild.storage.settings.get('prefix')
            : config.default_prefix;
        const setprefix = `To change my prefix run \`${prefix}setprefix <prefix>\``;
        const help = `To get started run \`${prefix}help\`.\n\n${setprefix}`;

        const embed = new RichEmbed();
        embed.setThumbnail(this.user.avatarURL);
        embed.setColor(7911109);
        embed.setDescription(
            `Hello, my name is **${this.user.username}**. Thank you for inviting me!\n\n${help}`
        );

        const defaultChannel: GuildChannel = guild.channels.find(c =>
            c.permissionsFor(guild.me).has('SEND_MESSAGES')
        );
        const channelToMessage: TextChannel = this.channels.get(defaultChannel.id) as TextChannel;
        channelToMessage.send({ embed });
    }

    @on('userUpdate')
    private async _onUserUpdate(oldUser: User, newUser: User): Promise<void> {
        Database.db.models.User.update(
            {
                username: newUser.username,
                avatarUrl: newUser.avatarURL,
                discriminator: newUser.discriminator
            },
            { where: { id: newUser.id } }
        );
    }
}
