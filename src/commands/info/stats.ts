import { RichEmbed } from 'discord.js';
import { Command, Message } from 'yamdbf';
import { BotClient } from '../../client/botClient';

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'stats',
            desc: 'Get various bot statistics.',
            usage: '<prefix>stats',
            group: 'info'
        });
    }

    async action(message: Message): Promise<any> {
        const fractionalDigits = 2;
        const memUnit = 1024;
        const memoryUsage = process.memoryUsage().heapUsed / memUnit / memUnit;

        const colour = 7911109;
        const embed = new RichEmbed()
            .addField('Servers', this.client.guilds.size)
            .addField('Channels', this.client.channels.size)
            .addField('Users', this.client.users.size)
            .addField('Memory Usage', `${memoryUsage.toFixed(fractionalDigits)} MB`)
            .setTitle(`${this.client.user.username.toUpperCase()}'S STATISTICS`)
            .setColor(colour);

        return message.channel.sendEmbed(embed);
    }
}
