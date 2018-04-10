import { RichEmbed } from 'discord.js';
import { Command, Message } from 'yamdbf';
import { BotClient } from '../../client/botClient';
import * as responses from '../../data/8ball';

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'version',
            desc: 'Get the current bot version.',
            usage: '<prefix>version',
            group: 'info'
        });
    }

    async action(message: Message): Promise<any> {
        const version = require('../../../package.json').version || '0.0.0';
        const git = require('child_process').spawn('git', ['log', '-n', '1']);

        const embed = new RichEmbed().setTitle('Version information').addField('Version', version);

        git.stdout.on('data', data => {
            if (data) {
                const commit = data.toString();
                embed.addField('Commit', commit);

                return message.channel.sendEmbed(embed);
            }
        });

        git.on('close', code => {
            if (code !== 0) return message.channel.sendEmbed(embed);
        });
    }
}
