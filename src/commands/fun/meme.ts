import { Command, Message } from 'yamdbf';
import { BotClient } from '../../client/botClient';
import * as memes from '../../data/memes';

import * as bluebird from 'bluebird';
import * as Imgflipper from 'imgflipper';

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'meme',
            desc: 'Generate a meme with ImgFlipper.',
            usage: '<prefix>meme <meme>, <toptext>, <bottomtext>',
            group: 'fun',
            argOpts: { separator: ',' }
        });
    }

    async action(
        message: Message,
        [memeName, top, bottom]: [string, string, string]
    ): Promise<any> {
        const username: string = await message.guild.storage.settings.get('imgflip_user');
        const password: string = await message.guild.storage.settings.get('imgflip_pass');
        const imgFlip: Imgflipper = new Imgflipper(username, password);

        memeName = memeName.toLowerCase().trim();
        if (memeName === 'list') {
            let list = '';
            for (const meme in memes.default) {
                list += `${meme}\n`;
            }
            message.author.send({
                embed: { title: 'All available memes', description: list }
            });
            return message.reply('Sent you a DM with list of available memes.');
        }

        if (!memes.default[memeName])
            return message.channel.send(
                'Please pass a valid meme or `list` to get a list of valid memes.'
            );

        const flipper: any = bluebird.promisify(imgFlip.generateMeme);

        return flipper(memes.default[memeName], top, bottom)
            .then(image => message.channel.send(image))
            .catch(err => message.channel.send(err.message));
    }
}
