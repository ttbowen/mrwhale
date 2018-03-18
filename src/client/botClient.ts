import { Client, ListenerUtil } from 'yamdbf';
const { on, once } = ListenerUtil;

const config = require('../../config.json');
const path = require('path');

export class BotClient extends Client {
    constructor() {
        super({
            token: config.discord_token,
            owner: config.discord_owner,
            ratelimit: '10/1m',
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
}
