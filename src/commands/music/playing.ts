import { RichEmbed, StreamDispatcher } from 'discord.js';
import * as moment from 'moment';
import 'moment-duration-format';
import { Command, Message } from 'yamdbf';

import { BotClient } from '../../client/botClient';
import { Track } from '../../music/track';

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'nowplaying',
            desc: 'Display info about the currently playing track.',
            usage: '<prefix>nowplaying',
            group: 'music',
            guildOnly: true,
            aliases: ['np']
        });
    }

    async action(message: Message): Promise<any> {
        const miliseconds = 1000;
        const guildId: string = message.guild.id;
        const currentTrack: Track = this.client.musicPlayer.playList.getCurrentTrack(guildId);
        const embed: RichEmbed = new RichEmbed();
        const dispatcher: StreamDispatcher = this.client.musicPlayer.streamDispatchers.get(guildId);

        if (!currentTrack || !dispatcher)
            return message.channel.send('Nothing is currently playing.');

        const padMax = 4;
        const playingDuration: string = moment
            .duration(dispatcher.time)
            .format('h:mm:ss')
            .padStart(padMax, '0:0');
        const totalDuration: string = moment
            .duration(currentTrack.duration * miliseconds)
            .format('h:mm:ss')
            .padStart(padMax, '0:0');

        const progressLength = 20;
        const percentage: number = Math.floor(
            dispatcher.time / (currentTrack.duration * miliseconds) * progressLength
        );
        let progress = '';

        for (let i = 0; i < progressLength; i++) {
            if (i === percentage) progress += '🔘';
            else progress += '▬';
        }

        embed.setTitle(`Now playing ${currentTrack.title}`);
        embed.setAuthor(message.author.username, message.author.avatarURL);
        embed.setThumbnail(currentTrack.thumbnail);
        embed.addField('Duration', `${playingDuration}/${totalDuration}`, true);
        embed.addField('By', `${currentTrack.author}`, true);
        embed.setDescription(`\`${progress}\``);

        return message.channel.send({ embed });
    }
}
