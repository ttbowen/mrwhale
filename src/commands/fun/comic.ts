import * as cheerio from 'cheerio';
import * as request from 'request-promise';
import { Client, Command, Message } from 'yamdbf';

import { BotClient } from '../../client/botClient';

export default class extends Command<BotClient> {
    public constructor() {
        super({
            name: 'comic',
            desc: 'Get a random webcomic.',
            usage: '<prefix>comic <cah|xkcd|smbc|theoatmeal|random>',
            group: 'fun'
        });
    }

    private async cah(): Promise<string> {
        const comic = await request('http://explosm.net/comics/random/');
        const $ = cheerio.load(comic);
        const result = `http:${$('#main-comic').attr('src')}`;

        return result;
    }

    private async xkcd(): Promise<string> {
        const options = {
            url: 'https://c.xkcd.com/random/comic/',
            rejectUnauthorized: false
        };
        const comic = await request(options);
        const $ = cheerio.load(comic);
        const result = `https:${$('#comic')
            .find('img')
            .first()
            .attr('src')}`;

        return result;
    }

    private async smbc(): Promise<string> {
        const comic = await request('http://www.smbc-comics.com/random.php');
        const $ = cheerio.load(comic);
        const result = `${$('#cc-comicbody')
            .find('img')
            .first()
            .attr('src')}`;

        return `http://www.smbc-comics.com${result}`;
    }

    private async oatmeal(): Promise<string> {
        const comic = await request('http://theoatmeal.com/feed/random');
        const $ = cheerio.load(comic);
        const result = `${$('#comic')
            .find('img')
            .first()
            .attr('src')}`;

        return result;
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
