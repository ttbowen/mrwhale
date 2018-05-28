import { TextChannel, VoiceConnection } from 'discord.js';
import { Message } from 'yamdbf';

/**
 * Represents the play options.
 */
export interface PlayOptions {
    voice: VoiceConnection;
    channel: TextChannel;
}
