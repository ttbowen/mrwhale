import { RichEmbed } from 'discord.js';
import * as request from 'request-promise';
import { Command, CommandDecorators, Message, Middleware } from 'yamdbf';
import { BotClient } from '../../client/botClient';
import asciify, * as fontList from '../../data/asciify';

const { resolve, expect } = Middleware;
const { using } = CommandDecorators;

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'asciify',
            desc: 'ASCIIfy your text',
            usage: '<prefix>asciify <font index> <text>',
            aliases: ['graffiti'],
            group: 'fun',
            ratelimit: '5/1m'
        });
    }

    private formatAscii(text: string): string {
        let formattedAscii = '';
        let currentIndex = 0;
        do {
            if (text[currentIndex] === '\n') formattedAscii += '\n';
            else if (text[currentIndex] === ' ') formattedAscii += '░';
            else formattedAscii += '▓';

            currentIndex++;
        } while (currentIndex < text.length);
        return formattedAscii;
    }

    @using(resolve('fontID: Number, ...text: String'))
    @using(expect('fontID: Number, ...text: String'))
    async action(message: Message, [fontID, ...text]: [number, string[]]): Promise<any> {
        const fonts: string[] = fontList.default;
        if (fontID >= fonts.length) fontID = fonts.length - 1;
        if (fontID < 0) fontID = 0;

        const textsToAsciify = `${encodeURI(text.join('+'))}`;
        const options = {
            url:
                'http://artii.herokuapp.com/make?font=' + fonts[fontID] + '&text=' + textsToAsciify,
            method: 'GET'
        };

        return request(options).then(asciified => {
            // const embed = new RichEmbed();
            // embed.setTitle('ASCIIFY');
            // embed.setURL(options.url);
            // embed.setAuthor(message.author.username, message.author.avatarURL);
            // embed.addField('ASCII ART', this.formatAscii(asciified), false);
            message.channel.send('```' + asciified + '```');
        });
    }
}
