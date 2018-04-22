import { Collection, VoiceChannel, VoiceConnection } from 'discord.js';
import { Guild } from 'yamdbf';
import { BotClient } from '../botClient';

/**
 * Manager for voice.
 */
export class VoiceManager {
    /**
     * Creates an instance of {@link VoiceManager}.
     * @param client The bot client.
     */
    constructor(private client: BotClient) {}

    /**
     * Check whether there is a voice connection in this {@link Guild}.
     * @param guild The guild to check for voice connections.
     */
    isConnectionOnGuild(guild: Guild): boolean {
        const voiceConnections: Collection<string, VoiceConnection> = this.client.voiceConnections;
        if (voiceConnections.find(c => c.channel.guild.id === guild.id)) return true;
        return false;
    }

    /**
     * Check if the bot client is connected to the passed {@link VoiceChannel}.
     * @param voiceChannel The voice channel to check.
     */
    isOnChannel(voiceChannel: VoiceChannel): boolean {
        const voiceConnections: Collection<string, VoiceConnection> = this.client.voiceConnections;
        if (voiceConnections.size === 0) return false;
        if (this.client.voiceConnections.find(c => c === voiceChannel.connection)) return true;
        return false;
    }

    /**
     * Return connection on specified {@link Guild}.
     * @param guild The guild to search.
     */
    getGuildConnection(guild: Guild): VoiceConnection {
        const voiceConnections: Collection<string, VoiceConnection> = this.client.voiceConnections;
        return voiceConnections.find(c => c.channel.guild.id === guild.id);
    }
}
