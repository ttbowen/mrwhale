import { GuildMember, RichEmbed } from 'discord.js';
import { Command, CommandDecorators, Message, Middleware } from 'yamdbf';

import { BotClient } from '../../client/botClient';
import { LevelManager } from '../../client/managers/levelManager';
import { Database } from '../../database/database';
import { User } from '../../entity/user';
import { UserExpStats } from '../../entity/userExpStats';
import { Player } from '../../types/player';

const { resolve } = Middleware;
const { using } = CommandDecorators;

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'rank',
            desc: 'Get your current rank.',
            usage: '<prefix>rank',
            group: 'level',
            guildOnly: true
        });
    }

    @using(resolve('member?: Member'))
    async action(message: Message, [member]: [GuildMember]): Promise<any> {
        const enabled = await message.guild.storage.settings.get('levels');
        if (!enabled) return;

        try {
            const guildId = message.guild.id;
            let userId;

            if (!member) userId = message.author.id;
            else userId = member.id;

            const userStats: UserExpStats = await Database.connection
                .getRepository(UserExpStats)
                .findOne({ guildId: guildId, userId: userId });

            const players: UserExpStats[] = await Database.connection
                .getRepository(UserExpStats)
                .find({ guildId: guildId });

            const level: number = LevelManager.getLevelFromExp(userStats.exp);

            let xp = 0;
            for (let i = 0; i < level; i++) {
                xp += LevelManager.levelToExp(i);
            }
            const playerSorted = players.sort((a, b) => a.exp - b.exp).reverse();

            const info: Player = {
                totalExp: userStats.exp,
                levelExp: LevelManager.levelToExp(level),
                remainingExp: userStats.exp - xp,
                level: level,
                rank: playerSorted.findIndex(p => p.userId === userId) + 1
            };

            const user: User = await Database.connection
                .getRepository(User)
                .findOne({ id: userId });

            const colour = 7911109;
            const embed = new RichEmbed()
                .addField(`Rank`, `${info.rank}/${playerSorted.length}`, true)
                .addField(`Lvl`, `${info.level}`, true)
                .addField(`Lvl Exp`, `${info.remainingExp}/${info.levelExp}`, true)
                .addField(`Total Exp`, `${info.totalExp}`, true)
                .setColor(colour)
                .setAuthor(
                    member ? member.user.username : message.author.username,
                    member ? member.user.avatarURL : message.author.avatarURL
                );

            return message.channel.send({ embed });
        } catch {
            return message.channel.send(`An error occured while fetching rank.`);
        }
    }
}
