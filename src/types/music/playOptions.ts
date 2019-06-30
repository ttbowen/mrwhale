import { TextChannel, VoiceConnection } from 'discord.js';

/**
 * Represents the play options.
 */
export interface PlayOptions {
  voice: VoiceConnection;
  channel: TextChannel;
}
