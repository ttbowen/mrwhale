import * as bluebird from 'bluebird';
import * as Imgflipper from 'imgflipper';
import { ClientStorage, Command, Message } from 'yamdbf';
import { BotClient } from '../../client/botClient';
import * as memes from '../../data/memes';

const config = require('../../../config.json');

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
        const storage: ClientStorage = this.client.storage;

        if (!await storage.get('imgflip_user')) storage.set('imgflip_user', config.imgflip_user);
        if (!await storage.get('imgflip_pass')) storage.set('imgflip_pass', config.imgflip_pass);

        const imgFlip: Imgflipper = new Imgflipper(
            await storage.get('imgflip_user'),
            await storage.get('imgflip_pass')
        );

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
