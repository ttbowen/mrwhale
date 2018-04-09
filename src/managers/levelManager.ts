import { ListenerUtil, Message, Util } from 'yamdbf';
import { BotClient } from '../client/botClient';
import { Database } from '../database/database';
import User from '../database/models/User';
import UserExpStats from '../database/models/UserExpStats';
const { on, once, registerListeners } = ListenerUtil;

/**
 * Manages user levelling.
 */
export class LevelManager {
    private _lastMessages: { [guild: string]: { [user: string]: number } };

    constructor(private client: BotClient) {
        this._lastMessages = {};
        registerListeners(this.client, this);
    }

    /**
     * Convert level to experience.
     * @param level The level to calculate from.
     */
    static levelToExp(level: number): number {
        const base = 100;
        const multiplier = 5;
        const increasePerLevel = 50;

        return multiplier * level * level + increasePerLevel * level + base;
    }

    /**
     * Calculate level from experience.
     * @param exp The experience to calculate level from.
     */
    static getLevelFromExp(exp: number): number {
        let level = 0;
        let remainingExp = exp;

        while (remainingExp >= LevelManager.levelToExp(level)) {
            remainingExp -= LevelManager.levelToExp(level);
            level++;
        }

        return level;
    }

    private getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    @on('message')
    private async _onMessage(message: Message): Promise<any> {
        const enabled = await message.guild.storage.settings.get('levels');
        if (message.author.id === this.client.user.id || message.author.bot || !enabled) return;

        const timeForExp = 60000;
        const last =
            Util.getNestedValue(this._lastMessages, [message.guild.id, message.author.id]) ||
            -Infinity;

        if (Date.now() - last >= timeForExp) {
            Util.assignNestedValue(
                this._lastMessages,
                [message.guild.id, message.author.id],
                Date.now()
            );
            const min = 5;
            const max = 10;
            const expGain = this.getRandomInt(min, max);

            const user = await Database.db.models.User.findOrCreate({
                where: { id: message.author.id },
                defaults: {
                    id: message.author.id,
                    username: message.author.username,
                    discriminator: message.author.discriminator,
                    avatarUrl: message.author.avatarURL,
                    totalExp: 0,
                    expLastUpdated: null
                }
            });

            user[0].totalExp += expGain;
            user[0].save();

            const userExpStats = await Database.db.models.UserExpStats.findOrCreate({
                where: { userId: message.author.id, guildId: message.guild.id },
                defaults: {
                    userId: message.author.id,
                    guildId: message.guild.id,
                    exp: 0,
                    lastLevelUp: null
                }
            });
            const level = LevelManager.getLevelFromExp(userExpStats[0].exp);
            userExpStats[0].exp += expGain;
            userExpStats[0].save();

            const newLevel = LevelManager.getLevelFromExp(userExpStats[0].exp);

            if (newLevel !== level) {
                userExpStats[0].lastLevelUp = new Date();
                userExpStats[0].save();

                return message.reply(`Congrats. You just advanced to **Level ${newLevel}**!!`);
            }
        }
    }
}
