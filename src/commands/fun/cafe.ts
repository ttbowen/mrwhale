import { RichEmbed } from 'discord.js';
import * as request from 'request-promise';
import { Command, Message } from 'yamdbf';

import { BotClient } from '../../client/botClient';

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'cafe',
            desc: 'Get a random café image',
            usage: '<prefix>cafe',
            aliases: ['café','cafeimage'],
            group: 'fun'
        });
    }

    async action(message: Message): Promise<any> {
         const req = {
            url: `https://0mkk.cf/cafe/api.php`,
            method: 'GET',
            headers: {
                'Accept': '*/*',
                'User-Agent': '.'
            },
            json: false
        };
        let re: [string,string]
        request(req).then(body => { re = body.split("%") })
        const embed = new RichEmbed().setTitle('submitted by '+re[1]).setImage(re[0])
        return message.channel.send(embed)
    }
}
