import {
    Channel,
    Collection,
    Guild,
    GuildAuditLogsAction,
    GuildChannel,
    Role,
    StreamDispatcher,
    TextChannel,
    User,
    VoiceChannel
} from 'discord.js';
import * as request from 'request-promise';
import { isUndefined } from 'util';
import { Client, Command, CommandDecorators, Message, Middleware } from 'yamdbf';
import * as ytdl from 'ytdl-core';
import { BotClient } from '../../client/botClient';

const { resolve, expect } = Middleware;
const { using } = CommandDecorators;

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'playtube',
            desc: 'play an audio stream from a youtube link',
            usage: '<prefix>playtube <link>/<search query>/<stop>/info',
            group: 'fun'
        });
    }

    checkConnection(voiceChannel: VoiceChannel, client: BotClient): boolean {
        let index = 0;
        if (
            isUndefined(client.voiceConnections.array) ||
            client.voiceConnections.array().length === 0
        ) {
            return false;
        } else {
            do {
                if (client.voiceConnections.array()[index] === voiceChannel.connection) {
                    return true;
                }
                index++;
            } while (index < client.voiceConnections.array.length);
        }
        return false;
    }

    async action(message: Message, args: string[]): Promise<any> {
        const ytRegex = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?/gm;

        if (message.member.voiceChannel === undefined) {
            return message.channel.send("You're not within any voice channel. Join one first");
        } else if (args[0].toLowerCase() === 'stop') {
            message.member.voiceChannel.leave();
        } else if (args[0].match(ytRegex) === null) {
            message.channel.send('Not a valid video link');
        } else {
            if (this.checkConnection(message.member.voiceChannel, this.client)) {
                message.member.voiceChannel.leave();
            }

            const urlIdRegexGroup = 5;
            const videoId = ytRegex.exec(args[0]);
            const options = {
                url: 'https://www.googleapis.com/youtube/v3/videos',
                qs: {
                    key: await this.client.storage.get('youtube_api'),
                    id: videoId[urlIdRegexGroup],
                    part: 'snippet'
                },
                json: true
            };

            request(options).then(body => {
                message.channel.send(
                    '**Now Playing: **' + '- ' + body.items[0].snippet.title + ' -'
                );
            });

            message.guild.storage.set('current_vid', options.qs.id);

            message.member.voiceChannel
                .join()
                .then(connection => {
                    const dispatcher = connection.playStream(ytdl(args[0]));
                    dispatcher.setVolume(1);
                    dispatcher.on('end', () => connection.channel.leave());
                })
                .catch(() => message.channel.send('connection error'));
        }
    }
}
