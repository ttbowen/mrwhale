import { Command, Message } from 'yamdbf';

import { BotClient } from '../client/botClient';

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'invite',
            desc: 'Get an invite link.',
            usage: '<prefix>invite'
        });
    }

    async action(message: Message): Promise<any> {
        return message.channel.send(`
        You can invite me to your server with this link:\n <https://discordapp.com/oauth2/authorize?client_id=${
            this.client.user.id
        }&scope=bot&permissions=2146958591>`);
    }
}
