import { LogLevel, Providers } from 'yamdbf';
import { BotClient } from './client/botClient';

const config = require('../config.json');
const db = require('../db.json');

const client: BotClient = new BotClient({
    token: config.discord_token,
    owner: config.discord_owner,
    ratelimit: '10/1m',
    logLevel: LogLevel.ERROR,
    localeDir: './dist/locale',
    statusText: 'In the Ocean.',
    commandsDir: './dist/commands',
    pause: true,
    passive: false,
    provider: Providers.SQLiteProvider(db.settings_db_url)
});
client.start();

const exitCode = 100;
client.on('disconnect', () => process.exit(exitCode));
