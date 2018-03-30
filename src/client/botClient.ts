import { Client, ListenerUtil, LogLevel } from 'yamdbf';
import { ModerationManager } from '../managers/moderationManager';
const { on, once } = ListenerUtil;

const config = require('../../config.json');
const path = require('path');

export class BotClient extends Client {
    moderation: ModerationManager;

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
        this.continue();
    }

    @once('clientReady')
    private async _onClientReady(): Promise<void> {
        this.moderation = new ModerationManager(this);
    }
}
