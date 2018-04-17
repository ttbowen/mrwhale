import {
    Channel,
    Guild,
    GuildChannel,
    GuildMember,
    RichEmbed,
    StreamDispatcher,
    VoiceChannel
} from 'discord.js';
import * as request from 'request-promise';
import { Client, Command, Message, Util } from 'yamdbf';
import * as ytdl from 'ytdl-core';
import { BotClient } from '../../client/botClient';

export default class extends Command<BotClient> {
    private _currentVidId: { [guild: string]: string };
    // The format should be Array<[video id, video name]>
    private _currentPlaylistIds: { [guild: string]: Array<[string, string]> };
    // Make sure to set to true whenever a track change command is occuring
    // To avoid command stacking
    private _changingTracks: { [guild: string]: boolean };

    constructor() {
        super({
            name: 'playtube',
            desc: 'play an audio stream from a youtube link',
            usage: '<prefix>playtube <link>/<search query>/<stop>/<info>/<next>/<previous>',
            group: 'music',
            aliases: ['yt', 'radio', 'youtube'],
            guildOnly: true
        });
        this._currentVidId = {};
        this._currentPlaylistIds = {};
        this._changingTracks = {};
    }

    async autoPlayNext(message: Message): Promise<void> {
        // Do a check to avoid command stacking
        if (
            (!Util.getNestedValue(this._currentPlaylistIds, [message.guild.id]) ||
            Util.getNestedValue(this._currentPlaylistIds, [message.guild.id]).length === 0) ||
            (Util.getNestedValue(this._changingTracks, [message.guild.id]) === true &&
             Util.getNestedValue(this._changingTracks, [message.guild.id]))
        ) {
            return;
        }
        // Do the following so that the autoplay keeps running
        // even when the original caller is no longer on the voice channel.
        const botMsg = await message.channel.send('Playing the next video in the playlist');
        return this.action(<Message>botMsg, ['next']);
    }

    // The data is always/should be cleared after every error that occurs
    // so that the bot won't be able to retrieve invalid data
    clearData(guildId: string): void {
        Util.assignNestedValue(this._currentVidId, [guildId], '');
        Util.assignNestedValue(this._currentPlaylistIds, [guildId], []);
        Util.assignNestedValue(this._changingTracks, [guildId], false);
    }

    // Check if the bot is connected to the same voice channel
    // Returns true if there is no connection on that guild
    checkConnection(voiceChannel: VoiceChannel, guild: Guild): boolean {
        let index = 0;
        let thereIsConnectionOnGuild = false;
        if (
            !this.client.voiceConnections.array ||
            this.client.voiceConnections.array().length === 0
        ) {
            return true;
        } else {
            do {
                if (this.client.voiceConnections.array()[index] === voiceChannel.connection) {
                    return true;
                }
                if (this.client.voiceConnections.array()[index].channel.guild.id === guild.id) {
                    thereIsConnectionOnGuild = true;
                }
                index++;
            } while (index < this.client.voiceConnections.array.length);
        }
        if (!thereIsConnectionOnGuild) {
            return true;
        }
        return false;
    }

    getNextIdFromPlaylist(playlist: Array<[string, string]>, currentId: string): number {
        let index = 0;
        let returnIndex = 0;
        do {
            if (currentId === playlist[index][0]) {
                if (playlist.length === 1) {
                    returnIndex = 0;
                    break;
                } else if (playlist.length - 1 === index) {
                    returnIndex = 0;
                    break;
                } else {
                    returnIndex = index + 1;
                    break;
                }
            }
            index++;
        } while (index < playlist.length);
        return returnIndex;
    }

    getPreviousIdFromPlaylist(playlist: Array<[string, string]>, currentId: string): number {
        let index = 0;
        let returnIndex = 0;
        do {
            if (currentId === playlist[index][0]) {
                if (playlist.length === 1) {
                    returnIndex = 0;
                    break;
                } else if (index - 1 < 0) {
                    returnIndex = playlist.length - 1;
                    break;
                } else {
                    returnIndex = index - 1;
                    break;
                }
            }
            index++;
        } while (index < playlist.length);
        return returnIndex;
    }

    generatePlaylistArray(body: any): Array<[string, string]> {
        const idArray = Array<[string, string]>(0);
        body.items.forEach(element => {
            idArray.push([element.contentDetails.videoId, element.snippet.title]);
        });
        return idArray;
    }

    leaveAllChannelsInGuild(guild: Guild): void {
        let index = 0;
        if (!this.client.voiceConnections || this.client.voiceConnections.array().length === 0) {
            return;
        }
        do {
            if (this.client.voiceConnections.array()[index].channel.guild.id === guild.id) {
                this.client.voiceConnections.array()[index].channel.leave();
            }
            index++;
        } while (index < this.client.voiceConnections.array().length);
    }

    async action(message: Message, args: string[]): Promise<any> {
        const joinedArgs = args.join('').replace(/\s/g, '+');

        const videoId = (/[&?]v=([^&\s]+)/).exec(joinedArgs);
        const videoPlaylistId = (/[&?]list=([^&\s]+)/).exec(joinedArgs);

        const currentVidId = Util.getNestedValue(this._currentVidId, [message.guild.id]);
        let currentPlaylistId = Util.getNestedValue(this._currentPlaylistIds, [message.guild.id]);

        // the value in this variable is supposed to
        // be defined in the script. To save request count.
        // Except if the arg is info, Where the command only
        // needs the info and don't have to retrieve the video
        const options = {
            url: 'https://www.googleapis.com/youtube/v3/videos',
            qs: {
                key: await this.client.storage.get('youtube_api'),
                id: '',
                part: ''
            },
            json: true
        };
        if (joinedArgs.toLowerCase() === '') {
            return message.channel.send('No parameter is supplied. You can check it using the help command');
        }
        if (joinedArgs.toLowerCase() === 'stop') {
            this.clearData(message.guild.id);
            return this.leaveAllChannelsInGuild(message.guild);
        } else if (message.member.voiceChannel === undefined) {
            return message.channel.send('You\'re not within any voice channel. Join one first');
        } else if (!this.checkConnection(message.member.voiceChannel, message.guild)) {
            const errMsg = [
                'There\'s already a connected ',
                'voice channel for this bot! ',
                'Join that channel first!'
            ];

            return message.channel.send(errMsg.join(''));
        } else if (joinedArgs.toLowerCase() === 'info') {
            if (!currentVidId || currentVidId === '') {
                return message.channel.send('Nothing is currently playing...');
            }

            options.qs.id = currentVidId;
            options.qs.part = 'snippet,statistics';

            return request(options)
                .then(body => {
                    const embed = new RichEmbed();
                    embed.setTitle('INFO');
                    embed.setURL('https://www.youtube.com/watch?v=' + currentVidId);
                    embed.setImage(body.items[0].snippet.thumbnails.default.url);
                    embed.setColor('black');
                    embed.addField(
                        body.items[0].snippet.title,
                        'Author: ' +
                            body.items[0].snippet.channelTitle +
                            '\n**Favorites** :star: : ' +
                            body.items[0].statistics.favoriteCount +
                            '\n**Likes** :thumbsup: : ' +
                            body.items[0].statistics.likeCount +
                            '   **Dislikes** :thumbsdown: : ' +
                            body.items[0].statistics.dislikeCount
                    );
                    message.channel.send({ embed });
                })
                .catch(err => {
                    this.clearData(message.guild.id);
                    return message.channel.send('Can\'t connect to info api. Error: ' + err);
                });
        } else if (joinedArgs.toLowerCase() === 'next' || joinedArgs.toLowerCase() === 'previous') {
            if (!currentPlaylistId || currentPlaylistId.length === 0) {
                return message.channel.send('You didn\'t supply a playlist');
            } else if (!currentVidId || currentVidId === '') {
                return message.channel.send('Nothing is currently playing');
            }
            Util.assignNestedValue(this._changingTracks, [message.guild.id], true);
            options.qs.part = 'snippet';
            if (joinedArgs.toLowerCase() === 'next') {
                options.qs.id = currentPlaylistId[this.getNextIdFromPlaylist(currentPlaylistId, currentVidId)][0];
            } else {
                options.qs.id = currentPlaylistId[this.getPreviousIdFromPlaylist(currentPlaylistId, currentVidId)][0];
            }
        } else if (videoId !== null || videoPlaylistId !== null) {
            if (videoId !== null) {
                Util.assignNestedValue(this._changingTracks, [message.guild.id], true);
                options.qs.part = 'snippet';
                options.qs.id = videoId[1];
            }
            if (videoPlaylistId != null && videoPlaylistId[1] !== null) {
                const playlistOption = {
                    url: 'https://www.googleapis.com/youtube/v3/playlistItems',
                    qs: {
                        key: await this.client.storage.get('youtube_api'),
                        playlistId: videoPlaylistId[1],
                        part: 'contentDetails,snippet',
                        maxResults: '25'
                    },
                    json: true
                };
                await request(playlistOption)
                    .then(body => {
                        if (!body.items || body.items.length === 0) {
                            this.clearData(message.guild.id);
                            return message.channel.send('Can\'t find any video in the playlist');
                        } else {
                            Util.assignNestedValue(
                                this._currentPlaylistIds,
                                [message.guild.id],
                                this.generatePlaylistArray(body)
                            );
                            currentPlaylistId = Util.getNestedValue(
                                this._currentPlaylistIds, [message.guild.id]
                            );

                            // If the playlist id isn't null but the video id is,
                            // the first video in the playlist is played
                            if (videoId === null) {
                                Util.assignNestedValue(this._changingTracks, [message.guild.id], true);
                                options.qs.part = 'snippet';
                                options.qs.id = currentPlaylistId[0][0];
                            }
                        }
                    })
                    .catch(err => {
                        this.clearData(message.guild.id);
                         // Remove the header of an error
                         // and get the pure json
                        const errorRegex = /[{]([^]+)/g;
                        const errorParsed = JSON.parse(errorRegex.exec(err)[0]);
                        if (errorParsed.error) {
                            if (errorParsed.error.code === +'403') {
                                return message.channel.send(
                                    'Playlist is private. Make sure the playlist is public first!'
                                );
                            } else if (errorParsed.error.code === +'404') {
                                return message.channel.send(
                                    'No playlist with that id is found. Is the id correct?'
                                );
                            } else {
                                return message.channel.send(
                                    errorParsed.error.errors[0].message
                                );
                            }
                        }
                        return message.channel.send(
                            'Can\'t create playlist array. Error: ' + err
                        );
                    });
            } else {
                Util.assignNestedValue(this._currentPlaylistIds, [message.guild.id], {});
            }
        }
        // Search for a video if none of the other arguments are detected
        else {
            const searchoptions = {
                url: 'https://www.googleapis.com/youtube/v3/search',
                qs: {
                    key: await this.client.storage.get('youtube_api'),
                    type: 'video',
                    q: joinedArgs,
                    part: 'snippet',
                    regionCode: 'GB',
                    maxResults: '1'
                },
                json: true
            };

            const tempMsg = <Message> await message.channel.send('Searching for a video with that name...');

            await request(searchoptions)
                .then(body => {
                    if (!body.items || body.items.length === 0) {
                        tempMsg.delete();
                        this.clearData(message.guild.id);
                        return message.channel.send('Can\'t find any video matching the query');
                    } else {
                        tempMsg.delete();
                        this.clearData(message.guild.id);
                        currentPlaylistId = {};
                        Util.assignNestedValue(this._changingTracks, [message.guild.id], true);
                        options.qs.part = 'snippet';
                        options.qs.id = body.items[0].id.videoId;
                    }
                })
                .catch(err => {
                    this.clearData(message.guild.id);
                    return message.channel.send('Can\'t connect to video search api. Error: ' + err);
                });
        }

        if ((!Util.getNestedValue(this._currentVidId, [message.guild.id]) ||
            Util.getNestedValue(this._currentVidId, [message.guild.id]) === '') &&
            options.qs.id === '') {
             return;
        }

        const channel = message.member.voiceChannel;

        // Leave all channel in the senders guild to avoid packet error.
        // Also gives a nice notification whenever
        // the current stream changes
        this.leaveAllChannelsInGuild(message.guild);
        Util.assignNestedValue(this._changingTracks, [message.guild.id], false);

        request(options).then(body => {
            message.channel.send('**Now Playing: **' + '- ' + body.items[0].snippet.title + ' -');
            if (
                Util.getNestedValue(this._currentPlaylistIds, [message.guild.id]) &&
                Util.getNestedValue(this._currentPlaylistIds, [message.guild.id]).length !== 0
            ) {
                message.channel.send('**Next** : ' +
                currentPlaylistId[this.getNextIdFromPlaylist(currentPlaylistId, options.qs.id)][1]);
                message.channel.send('**Previous** : ' +
                currentPlaylistId[this.getPreviousIdFromPlaylist(currentPlaylistId, options.qs.id)][1]);
            }
        });

        const videoUrl = 'htpps://www.youtube.com/watch?v=' + options.qs.id;

        const streamOption = {
            highWaterMark: 3145728, // <-- The amount of preload allowed in bytes
            quality: 'highestaudio' // <-- Allow streaming of audio only even on live video
        };

        channel
            .join()
            .then(connection => {
                const dispatcher = connection.playStream(ytdl(videoUrl, streamOption));
                Util.assignNestedValue(this._currentVidId, [message.guild.id], options.qs.id);
                dispatcher.setVolume(1);
                dispatcher.on('end', () => {
                    if (
                        !Util.getNestedValue(this._currentPlaylistIds, [message.guild.id]) ||
                        Util.getNestedValue(this._currentPlaylistIds, [message.guild.id]).length === 0
                    ) {
                        channel.leave();
                        if (!Util.getNestedValue(this._changingTracks, [message.guild.id])) {
                            message.channel.send('Finished playing!');
                        }
                        return this.clearData(message.guild.id);
                    } else {
                        // This is done so no loop is going to happen. Since leaving a channel
                        // automatically calls the 'end' event
                        if (
                            this.client === message.member.client ||
                            joinedArgs.toLowerCase() !== 'next'
                        ) {
                            this.autoPlayNext(message);
                        }
                    }
                });
            })
            .catch(err => {
                this.clearData(message.guild.id);
                message.channel.send('Can\'t play url. Error: ' + err);
            });
    }
}
