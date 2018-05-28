import { RichEmbed } from 'discord.js';
import * as request from 'request-promise';
import { Client, Command, Message } from 'yamdbf';

import { BotClient } from '../../client/botClient';
import { Database } from '../../database/database';
import { Dictionary } from '../../entity/dictionary';
import { User } from '../../entity/user';
import { truncate } from '../../util/truncate';

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'chdef',
            desc: 'Change a definition for the `define` command.',
            usage: '<prefix>chdef <word>',
            group: 'useful'
        });
    }

    async action(message: Message, args: string[]): Promise<any> {
        const word: string = args.join(' ');
        message.channel.send(`Please enter a new definition for ${word}`);

        const newDef: Message = (await message.channel.awaitMessages(
            a => a.author.id === message.author.id,
            { max: 1, time: 20000 }
        )).first();

        const dictionary: Dictionary = new Dictionary();
        dictionary.definition = newDef.content;
        dictionary.word = word;

        message.channel.send(`Please enter an example for ${word}`);

        const newExample: Message = (await message.channel.awaitMessages(
            a => a.author.id === message.author.id,
            { max: 1, time: 20000 }
        )).first();

        dictionary.example = newDef.content;
        dictionary.guildId = message.guild.id;
        dictionary.user = new User();
        dictionary.user.id = message.author.id;

        Database.connection.getRepository(Dictionary).save(dictionary);

        return message.channel.send('Successfully changed definition');
    }
}
