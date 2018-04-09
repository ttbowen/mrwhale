import { Client, ListenerUtil, LogLevel, Providers } from 'yamdbf';
import { Database } from '../database/database';
import { LevelManager } from '../managers/levelManager';
import { ModerationManager } from '../managers/moderationManager';
const { on, once } = ListenerUtil;

const config = require('../../config.json');
const db = require('../../db.json');
const path = require('path');

export class BotClient extends Client {
    private _moderation: ModerationManager;
    private _levelManager: LevelManager;
    private _database: Database;

    get moderation(): ModerationManager {
        return this._moderation;
    }

    get database(): Database {
        return this._database;
    }

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
        this._database = Database.instance(db.main_db_url);
    }

    @once('pause')
    private async _onPause(): Promise<void> {
        await this.setDefaultSetting('prefix', config.default_prefix);
        await this.setDefaultSetting('imgflip_user', config.imgflip_user);
        await this.setDefaultSetting('imgflip_pass', config.imgflip_pass);
        await this.setDefaultSetting('pastebin', config.pastebin);
        await this.setDefaultSetting('levels', true);
        this.continue();
    }

    @once('clientReady')
    private async _onClientReady(): Promise<void> {
        await this._database.init();
        this._moderation = new ModerationManager(this);
        this._levelManager = new LevelManager(this);
    }
}
