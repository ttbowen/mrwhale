import { Collection, Role, TextChannel, User } from 'discord.js';
import { Command, CommandDecorators, Message, Middleware } from 'yamdbf';
import { BotClient } from '../client/botClient';

const { resolve, expect } = Middleware;
const { using } = CommandDecorators;

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'setup',
            desc: 'Setup bot.',
            usage: '<prefix>setup <option> <value>',
            group: 'mod',
            guildOnly: true
        });
    }

    @using(function(message: any, args: string[]): any {
        if (args[0].toLowerCase().includes('modrole')) {
            return resolve('option: String, ...value?: Role').call(this, message, args);
        } else if (args[0].toLowerCase().includes('musicrole')) {
            return resolve('option: String, ...value?: Role').call(this, message, args);
        } else return [message, args];
    })
    async action(message: Message, [option, value]: [string, Role | string]): Promise<any> {
        const isOwner = this.client.isOwner(message.author);
        const channel = message.channel as TextChannel;

        if (!(isOwner || channel.permissionsFor(message.member).has('MANAGE_GUILD'))) {
            return message.channel.send(
                'You must have permissions to manage the server to use this.'
            );
        }

        option = option.trim().toLowerCase();
        if (option === 'modrole') {
            message.guild.storage.settings.set('modrole', (value as Role).id);
            message.channel.send('Successfully set moderation role.');
        } else if (option === 'musicrole') {
            message.guild.storage.settings.set('musicrole', (value as Role).id);
            message.channel.send('Successfully set music role.');
        }
    }
}
