import { GuildMember, RichEmbed, TextChannel, VoiceChannel, VoiceConnection } from 'discord.js';
import * as moment from 'moment';
import { Command, Message } from 'yamdbf';
import * as ytdl from 'ytdl-core';

import { BotClient } from '../../client/botClient';
import { Track } from '../../music/track';
import { TrackBuilder } from '../../music/trackBuilder';
import { PlayOptions } from '../../types/music/playOptions';

export default class extends Command<BotClient> {
  constructor() {
    super({
      name: 'play',
      desc: 'play an audio stream from YouTube.',
      usage: '<prefix>play <url>',
      group: 'music',
      guildOnly: true,
      aliases: ['p', 'yt', 'request']
    });
  }

  private async getVoiceConnection(member: GuildMember): Promise<VoiceConnection> {
    const channel: VoiceChannel = member.voiceChannel;
    let connection: VoiceConnection;
    if (this.client.musicPlayer.voiceManager.isConnectionOnGuild(member.guild)) {
      connection = this.client.musicPlayer.voiceManager.getGuildConnection(member.guild);
    } else {
      connection = await channel.join();
    }

    return connection;
  }

  async action(message: Message, args: string[]): Promise<any> {
    const channel: VoiceChannel = message.member.voiceChannel;
    const guildId: string = message.guild.id;
    const videoOrSearch: string = args.join('');
    const regex: RegExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;

    if (!channel) {
      return message.channel.send('You need to join a voice channel first.');
    }

    const connection: VoiceConnection = await this.getVoiceConnection(message.member);

    const videoMatch: RegExpMatchArray = videoOrSearch.match(regex);
    const videoId: string = videoMatch && videoMatch[2] ? videoMatch[2] : '';
    if (!ytdl.validateID(videoId)) {
      return message.channel.send('You must enter a valid youtube video.');
    }
    const videoInfo: ytdl.videoInfo = await this.client.musicPlayer.getVideoInfo(videoId);
    const playOptions: PlayOptions = {
      channel: message.channel as TextChannel,
      voice: connection
    };
    const track: Track = new TrackBuilder()
      .setAuthor(videoInfo.author.name)
      .setDuration(parseInt(videoInfo.length_seconds, 10))
      .setIsPlaying(false)
      .setRequestedBy(message.member)
      .setThumbail(videoInfo.thumbnail_url)
      .setTitle(videoInfo.title)
      .setUrl(videoOrSearch)
      .build();

    // When there is already a track playing add it to the queue.
    if (this.client.musicPlayer.streamDispatchers.has(guildId)) {
      this.client.musicPlayer.playList.add(guildId, track);
      const totalDuration: string = moment
        .duration(track.duration * 1000)
        .format('h:mm:ss')
        .padStart(4, '0:0');
      const embed: RichEmbed = new RichEmbed();
      embed.addField(`Added track to queue`, `**[${track.title}](${track.url})**`);
      embed.addField('By', `${track.author}`, true);
      embed.addField('Track Duration', totalDuration, true);
      embed.setThumbnail(track.thumbnail);

      return message.channel.send({ embed });
    }

    try {
      this.client.musicPlayer.play(track, playOptions);
      return message.channel.send(`**Now playing** :notes: \`${track.title}\``);
    } catch {
      return message.channel.send('Could not play the audio.');
    }
  }
}
