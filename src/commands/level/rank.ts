import { RichEmbed } from 'discord.js';
import { Command, Message } from 'yamdbf';
import { BotClient } from '../../client/botClient';
import { Database } from '../../database/database';
import UserExpStats from '../../database/models/UserExpStats';
import { LevelManager } from '../../managers/levelManager';
import { Player } from '../../types/player';

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

    async action(message: Message): Promise<any> {
        try {
            const guildId = message.guild.id;
            const userId = message.author.id;
            const user: UserExpStats = await Database.db.models.UserExpStats.findOne({
                where: { guildId: guildId, userId: userId }
            });
            const players: UserExpStats[] = await Database.db.models.UserExpStats.findAll({
                where: { guildId: guildId }
            });
            const level = LevelManager.getLevelFromExp(user.exp);

            let xp = 0;
            for (let i = 0; i < level; i++) {
                xp += LevelManager.levelToExp(i);
            }
            const playerSorted = players.sort((a, b) => a.exp - b.exp).reverse();

            const info: Player = {
                totalExp: user.exp,
                levelExp: LevelManager.levelToExp(level),
                remainingExp: user.exp - xp,
                level: level,
                rank: playerSorted.findIndex(p => p.userId === userId) + 1
            };

            const colour = 7911109;
            const embed = new RichEmbed()
                .addField(`Rank`, `${info.rank}/${playerSorted.length}`)
                .addField(`Level`, `${info.level}`, true)
                .addField(`Level Exp`, `${info.remainingExp}/${info.levelExp}`, true)
                .addField(`Total Exp`, `${info.totalExp}`, true)
                .setColor(colour)
                .setAuthor(message.author.username, message.author.avatarURL);

            return message.channel.send('', { embed: embed });
        } catch {
            return message.channel.send(`An error occured while fetching rank`);
        }
    }
}
