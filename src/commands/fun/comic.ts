import { Client, Command, Message } from 'yamdbf';
import { BotClient } from '../../client/BotClient';

import * as bluebird from 'bluebird';
import * as cheerio from 'cheerio';
import * as _request from 'request';

const request: any = bluebird.promisify(_request);

export default class extends Command {
    public constructor() {
        super({
            name: 'comic',
            desc: 'Get a random webcomic.',
            usage: '<prefix>comic <cah|xkcd|smbc|theoatmeal|random>',
            group: 'fun'
        });
    }

    private async cah(): Promise<string> {
        return request('http://explosm.net/comics/random/')
            .then(response => response.body)
            .then(cheerio.load)
            .then($ => `http:${$('#main-comic').attr('src')}`);
    }

    private async xkcd(): Promise<string> {
        const options = {
            url: 'https://c.xkcd.com/random/comic/',
            rejectUnauthorized: false
        };

        return request(options)
            .then(response => response.body)
            .then(cheerio.load)
            .then(
                $ =>
                    `https:${$('#comic')
                        .find('img')
                        .first()
                        .attr('src')}`
            );
    }

    private async smbc(): Promise<string> {
        return request('http://www.smbc-comics.com/random.php')
            .then(response => response.body)
            .then(cheerio.load)
            .then($ =>
                $('#cc-comicbody')
                    .find('img')
                    .first()
                    .attr('src')
            )
            .then(url => `http://www.smbc-comics.com${url}`);
    }

    private async oatmeal(): Promise<string> {
        return request('http://theoatmeal.com/feed/random')
            .then(response => response.body)
            .then(cheerio.load)
            .then($ =>
                $('#comic')
                    .find('img')
                    .first()
                    .attr('src')
            );
    }

    private async random(): Promise<any> {
        const commands = [this.cah, this.xkcd, this.smbc, this.oatmeal];
        const rand = Math.floor(Math.random() * commands.length);
        return commands[rand]();
    }

    public async action(message: Message, [comic]: [string]): Promise<any> {
        if (!comic) return message.channel.send(await this.random());

        comic = comic.toLowerCase();

        if (comic === 'random') return message.channel.send(await this.random());

        if (comic === 'cah') return message.channel.send(await this.cah());

        if (comic === 'xkcd') return message.channel.send(await this.xkcd());

        if (comic === 'smbc') return message.channel.send(await this.smbc());

        if (comic === 'theoatmeal') return message.channel.send(await this.oatmeal());
    }
}
