import {
    Collection,
    StreamDispatcher,
    TextChannel,
    VoiceChannel,
    VoiceConnection
} from 'discord.js';
import { Command, CommandDecorators, Message, Middleware, Util } from 'yamdbf';

import { BotClient } from '../../client/botClient';
import { PlayOptions } from '../../types/music/playOptions';
import { Search } from '../../types/music/search';
import { Track } from '../../types/music/track';

const { using } = CommandDecorators;
const { resolve, expect } = Middleware;

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'select',
            desc: 'Select the searched tracks.',
            usage: '<prefix>select <number>',
            group: 'music',
            guildOnly: true
        });
    }

    @using(resolve('option: Number'))
    @using(expect('option: Number'))
    async action(message: Message, [option]: [number]): Promise<any> {
        const guildId: string = message.guild.id;
        const memberId: string = message.member.id;
        const dispatchers: Collection<string, StreamDispatcher> = this.client.musicPlayer
            .streamDispatchers;
        const channel: VoiceChannel = message.member.voiceChannel;
        const connection: VoiceConnection = this.client.musicPlayer.voiceManager.getGuildConnection(
            message.guild
        );
        const search: Search = Util.getNestedValue(this.client.musicPlayer.trackSearch.searches, [
            guildId,
            memberId
        ]);

        if (option < 1 || option > 5)
            return message.channel.send('Please pass a number between 1 and 5');

        if (channel) {
            if (!this.client.musicPlayer.voiceManager.isOnChannel(channel))
                return message.channel.send('You must be in the same channel first.');

            if (search && search.complete) {
                const selected: Track = search.results[option - 1];
                const playOptions: PlayOptions = {
                    channel: message.channel as TextChannel,
                    voice: connection
                };

                if (this.client.musicPlayer.streamDispatchers.has(guildId)) {
                    this.client.musicPlayer.playList.add(guildId, selected);
                    search.msg.edit(`Added \`${selected.title}\` to the playlist.`);
                } else {
                    this.client.musicPlayer.play(selected, playOptions);
                    search.msg.edit(`**Now playing** :notes: \`${selected.title}\``);
                }
                Util.removeNestedValue(this.client.musicPlayer.trackSearch.searches, [
                    guildId,
                    memberId
                ]);
            }
        } else return message.channel.send('You need to join a voice channel first.');
    }
}
