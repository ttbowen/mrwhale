import { RichEmbed } from 'discord.js';
import { Command, Message } from 'yamdbf';
import { BotClient } from '../../client/botClient';
import { Track } from '../../types/music/track';

import * as moment from 'moment';
import 'moment-duration-format';

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'queue',
            desc: 'Display the queue of playlist tracks.',
            usage: '<prefix>queue',
            group: 'music',
            guildOnly: true,
            aliases: ['q']
        });
    }

    async action(message: Message): Promise<any> {
        const miliseconds = 1000;
        const guildId: string = message.guild.id;
        const tracks: Track[] = this.client.musicPlayer.playList.get(guildId);
        const current: Track = this.client.musicPlayer.playList.getCurrentTrack(guildId);
        const embed: RichEmbed = new RichEmbed();

        if (current) {
            embed.addField(
                '*Now Playing*',
                `${current.title} | ${moment
                    .duration(current.duration * miliseconds)
                    .format('h:mm:ss')} Requested by: ${current.requestedBy.user.username}`
            );
        }

        if (tracks && tracks.length !== 0) {
            embed.addField('Up next', ':track_next:');

            for (let i = 0; i < tracks.length; i++) {
                const title: string = tracks[i].title;
                const username: string = tracks[i].requestedBy.user.username;
                const duration: moment.Duration = moment.duration(tracks[i].duration * miliseconds);
                embed.addField(
                    `${i + 1}.`,
                    `${tracks[i].title} | ${duration.format(
                        'h:mm:ss'
                    )}  - Requested by: ${username}`,
                    true
                );
            }
        } else embed.addField('There is nothing in the queue', ':track_next:');

        return message.channel.send({ embed });
    }
}
