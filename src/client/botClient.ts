import { GuildChannel, RichEmbed, TextChannel, User } from 'discord.js';
import { Client, Guild, ListenerUtil, YAMDBFOptions } from 'yamdbf';

import { Database } from '../database/database';
import { User as BotUser } from '../entity/user';
import { LevelManager } from './managers/levelManager';
import { ModerationManager } from './managers/moderationManager';
import { MusicManager } from './managers/musicManager';

const config = require('../../config.json');
const { on, once } = ListenerUtil;

export class BotClient extends Client {
    private readonly _level: LevelManager;

    readonly moderation: ModerationManager;
    readonly musicPlayer: MusicManager;

    /**
     * Creates an instance of {@link BotClient}.
     * @param botOptions The bot options.
     */
    constructor(botOptions: YAMDBFOptions) {
        super(botOptions);
        this.moderation = new ModerationManager(this);
        this.musicPlayer = new MusicManager(this);
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
        await Database.instance().init();
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
        Database.connection.getRepository(BotUser).save({
            id: newUser.id,
            username: newUser.username,
            avatarUrl: newUser.avatarURL,
            discriminator: newUser.discriminator
        });
    }
}
