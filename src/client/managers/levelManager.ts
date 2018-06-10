import { GuildMember } from 'discord.js';
import { ListenerUtil, Message, Util } from 'yamdbf';

import { Database } from '../../database/database';
import { User } from '../../entity/user';
import { UserExpStats } from '../../entity/userExpStats';
import { BotClient } from '../botClient';

const { on, once, registerListeners } = ListenerUtil;

/**
 * Manages user levelling.
 */
export class LevelManager {
    private _lastMessages: { [guild: string]: { [user: string]: number } };

    /**
     * Creates an instance of {@link LevelManager}.
     * @param client The bot client.
     */
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

    private getRandomExp(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private async getPlayer(member: GuildMember): Promise<User> {
        let player: User = await Database.connection.getRepository(User).findOne({ id: member.id });

        if (!player) {
            player = new User();
            player.id = member.id;
            player.discriminator = member.user.discriminator;
            player.avatarUrl = member.user.avatarURL || member.user.defaultAvatarURL;
            player.username = member.user.username;
            player.totalExp = 0;
        }
        return player;
    }

    private isTimeForExp(guildId: string, userId: string): boolean {
        const timeForExp = 6e4;
        const last = Util.getNestedValue(this._lastMessages, [guildId, userId]) || -Infinity;
        return Date.now() - last >= timeForExp;
    }

    private async getPlayerStats(member: GuildMember): Promise<UserExpStats> {
        let playerStats: UserExpStats = await Database.connection
            .getRepository(UserExpStats)
            .findOne({ guildId: member.guild.id, userId: member.id });

        if (!playerStats) {
            playerStats = new UserExpStats();
            playerStats.guildId = member.guild.id;
            playerStats.userId = member.id;
            playerStats.exp = 0;
        }
        return playerStats;
    }

    @on('message')
    private async _onMessage(message: Message): Promise<any> {
        if (message.channel.type === 'dm') return;

        const timeForExp: boolean = this.isTimeForExp(message.guild.id, message.author.id);
        const enabled: boolean = (await message.guild.storage)
            ? await message.guild.storage.settings.get('levels')
            : true;

        if (message.author.bot || !enabled || !timeForExp) return;

        Util.assignNestedValue(
            this._lastMessages,
            [message.guild.id, message.author.id],
            Date.now()
        );

        const expGain: number = this.getRandomExp(5, 10);
        try {
            const user: User = await this.getPlayer(message.member);
            user.totalExp += expGain;
            user.expLastUpdated = new Date();
            Database.connection.getRepository(User).save(user);

            const userStats: UserExpStats = await this.getPlayerStats(message.member);
            const level: number = LevelManager.getLevelFromExp(userStats.exp);

            userStats.exp += expGain;
            Database.connection.getRepository(UserExpStats).save(userStats);

            const newLevel: number = LevelManager.getLevelFromExp(userStats.exp);

            if (newLevel > level) {
                userStats.lastLevelUp = new Date();
                Database.connection.getRepository(UserExpStats).save(userStats);

                return message.reply(`Congrats. You just advanced to **Level ${newLevel}**!!`);
            }
        } catch {}
    }
}
