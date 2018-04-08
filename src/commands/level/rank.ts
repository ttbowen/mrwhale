import { GuildMember, RichEmbed } from 'discord.js';
import { Command, CommandDecorators, Message, Middleware } from 'yamdbf';
import { BotClient } from '../../client/botClient';
import { Database } from '../../database/database';
import User from '../../database/models/User';
import UserExpStats from '../../database/models/UserExpStats';
import { LevelManager } from '../../managers/levelManager';
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

            const userStats: UserExpStats = await Database.db.models.UserExpStats.findOne({
                where: { guildId: guildId, userId: userId }
            });
            const players: UserExpStats[] = await Database.db.models.UserExpStats.findAll({
                where: { guildId: guildId }
            });
            const level = LevelManager.getLevelFromExp(userStats.exp);

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

            const user: User = await Database.db.models.User.findOne({
                where: { id: userId }
            });

            const colour = 7911109;
            const embed = new RichEmbed()
                .addField(`Rank`, `${info.rank}/${playerSorted.length}`, true)
                .addField(`Lvl`, `${info.level}`, true)
                .addField(`Lvl Exp`, `${info.remainingExp}/${info.levelExp}`, true)
                .addField(`Total Exp`, `${info.totalExp}`, true)
                .setColor(colour)
                .setAuthor(user.username, user.avatarUrl);

            return message.channel.send('', { embed: embed });
        } catch {
            return message.channel.send(`An error occured while fetching rank.`);
        }
    }
}
