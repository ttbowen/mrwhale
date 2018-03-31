import { Client, ListenerUtil, LogLevel } from 'yamdbf';
import { ModerationManager } from '../managers/moderationManager';
const { on, once } = ListenerUtil;

const config = require('../../config.json');
const path = require('path');

export class BotClient extends Client {
    private _moderation: ModerationManager;

    get moderation(): ModerationManager {
        return this._moderation;
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
            pause: true
        });
    }

    @once('pause')
    private async _onPause(): Promise<void> {
        await this.setDefaultSetting('prefix', config.default_prefix);
        await this.setDefaultSetting('imgflip_user', config.imgflip_user);
        await this.setDefaultSetting('imgflip_pass', config.imgflip_pass);
        this.continue();
    }

    @once('clientReady')
    private async _onClientReady(): Promise<void> {
        this._moderation = new ModerationManager(this);
    }
}
