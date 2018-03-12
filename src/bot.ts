import { BotClient } from './client/botClient';

const client: BotClient = new BotClient();
client.start();

const exitCode = 100;
client.on('disconnect', () => process.exit(exitCode));
