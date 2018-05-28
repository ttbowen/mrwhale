import { TextChannel } from 'discord.js';
import { Command, Message } from 'yamdbf';

import { BotClient } from '../../client/botClient';

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'enablelevels',
            desc: 'Enable levelling for server.',
            usage: '<prefix>enablelevels',
            group: 'level',
            aliases: ['enablelvls'],
            guildOnly: true
        });
    }

    async action(message: Message): Promise<any> {
        try {
            const isOwner = this.client.isOwner(message.author);
            const channel = message.channel as TextChannel;

            if (!(isOwner || channel.permissionsFor(message.member).has('MANAGE_GUILD'))) {
                return message.channel.send(
                    'You must have permissions to manage the server to use this.'
                );
            }
            message.guild.storage.settings.set('levels', true);
            return message.channel.send('Successfully enabled levels.');
        } catch {
            return message.channel.send('Could not enable levels.');
        }
    }
}
