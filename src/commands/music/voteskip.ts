import { Collection, GuildMember, VoiceChannel } from 'discord.js';
import { Command, Guild, Message } from 'yamdbf';

import { BotClient } from '../../client/botClient';
import { Track } from '../../music/track';

export default class extends Command<BotClient> {
  constructor() {
    super({
      name: 'voteskip',
      desc: 'Vote to skip the current playing track.',
      usage: '<prefix>voteskip',
      group: 'music',
      guildOnly: true,
      aliases: ['vs'],
      ratelimit: '3/1m'
    });
  }

  private getVotePercentage(guild: Guild): number {
    let votes = 0;
    const members: Collection<string, GuildMember> = this.getVoiceMembers(guild);

    for (const member of members.values()) {
      if (this.hasVoted(guild.id, member.id)) votes++;
    }

    const percentage: number = votes * 1.0 / members.size;
    return percentage;
  }

  private hasVoted(guildId: string, memberId: string): boolean {
    const skipVoters: Map<string, GuildMember> = this.client.musicPlayer.playList.skipVoters.get(
      guildId
    );

    return skipVoters.has(memberId);
  }

  private getVoiceMembers(guild: Guild): Collection<string, GuildMember> {
    const members: Collection<
      string,
      GuildMember
    > = this.client.musicPlayer.voiceManager.getGuildConnection(guild).channel.members;

    return members.filter(member => !member.user.bot);
  }

  async action(message: Message): Promise<any> {
    const channel: VoiceChannel = message.member.voiceChannel;
    const guildId: string = message.guild.id;
    const memberId: string = message.member.id;

    if (!this.client.musicPlayer.voiceManager.getGuildConnection(message.guild))
      return message.channel.send('I am not connected to any voice channel.');

    const members: Collection<string, GuildMember> = this.getVoiceMembers(message.member.guild);
    const minSkip = members.size < 3 ? 1.0 : 0.5;

    if (channel) {
      if (!this.client.musicPlayer.voiceManager.isOnChannel(channel))
        return message.channel.send('You must be in the same channel first.');

      if (this.client.musicPlayer.streamDispatchers.has(guildId)) {
        const skipVoters: Collection<string, Map<string, GuildMember>> = this.client.musicPlayer
          .playList.skipVoters;

        if (!skipVoters.has(guildId)) skipVoters.set(guildId, new Map());

        const guildVoters: Map<string, GuildMember> = skipVoters.get(guildId);

        if (guildVoters.has(memberId))
          return message.channel.send('You have already voted to skip this track.');

        guildVoters.set(memberId, message.member);

        const msg = (await message.channel.send(
          `${message.author.username} has voted to skip`
        )) as Message;

        if (this.getVotePercentage(message.guild) >= minSkip) {
          const current: Track = this.client.musicPlayer.playList.getCurrentTrack(guildId);
          msg.edit(`:fast_forward: Vote passed. Skipping... \`${current.title}\``);

          try {
            this.client.musicPlayer.streamDispatchers.get(guildId).end();
            return msg.edit(`:fast_forward: Skipped \`${current.title}\``);
          } catch {
            return msg.edit(`Could not skip ${current.title}`);
          }
        }
      } else return message.channel.send(`Not currently playing anything.`);
    } else return message.channel.send('You must join a channel first.');
  }
}
