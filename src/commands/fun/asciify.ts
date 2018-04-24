import { RichEmbed } from 'discord.js';
import * as request from 'request-promise';
import { Command, Message } from 'yamdbf';
import { BotClient } from '../../client/botClient';
import asciify, * as fontList from '../../data/asciify';

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'asciify',
            desc: 'ASCIIfy your text',
            usage: '<prefix>asciify <font index> <text>',
            aliases: ['graffiti'],
            group: 'fun',
            ratelimit: '2/1m'
        });
    }

    private formatAscii(text: string): string {
        let formattedAscii = '';
        let currentIndex = 0;
        do {
            if (text[currentIndex] === '\n') {
                formattedAscii += '\n';
            } else if (text[currentIndex] === ' ') {
                formattedAscii += '░';
            } else {
                formattedAscii += '▓';
            }
            currentIndex++;
        } while (currentIndex < text.length);
        return formattedAscii;
    }

    async action(message: Message, inputs: string[]): Promise<any> {
        const fontID = +inputs[0];
        if (Number.isNaN(fontID)) {
            return message.channel.send(
                'No valid number given. Please pass in a valid number for font id'
            );
        }
        if (fontID >= fontList.default.length) {
            return message.channel.send(
                `Please insert a number lower than ${fontList.default.length.toString()}`
            );
        }

        if (inputs.length === 1) {
            return message.channel.send(
                'No text is inserted. Or format is wrong. Use help command to see the format'
            );
        }

        let textsToAsciify = '';

        for (const index in inputs) {
            if (+index !== 0) {
                let loop = 0;
                do {
                    textsToAsciify += encodeURI(inputs[index][loop]);
                    loop++;
                } while (loop < inputs[index].length);
                if (+index < inputs.length - 1) {
                    textsToAsciify += '+';
                }
            }
        }

        const options = {
            url:
                'http://artii.herokuapp.com/make?font=' +
                fontList.default[fontID] +
                '&text=' +
                textsToAsciify,
            method: 'GET'
        };

        return request(options).then(asciified => {
            const embed = new RichEmbed();
            embed.setTitle('ASCIIFY');
            embed.setURL(options.url);
            embed.setAuthor(message.author.username, message.author.avatarURL);
            embed.addField('ASCII ART', this.formatAscii(asciified), false);
            message.channel.send({ embed });
        });
    }
}
