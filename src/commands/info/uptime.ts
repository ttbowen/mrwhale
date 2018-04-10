import { Command, Message, Time } from 'yamdbf';
import { BotClient } from '../../client/botClient';

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'uptime',
            desc: 'Get the bot uptime.',
            usage: '<prefix>uptime',
            group: 'info'
        });
    }

    async action(message: Message): Promise<any> {
        const multiplier = 2;
        const uptime = Time.difference(
            this.client.uptime * multiplier,
            this.client.uptime
        ).toString();

        return message.channel.send(`I have been up ${uptime}`);
    }
}
