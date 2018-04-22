import { TextChannel, VoiceConnection } from 'discord.js';
import { Message } from 'yamdbf';

export interface PlayOptions {
    voice: VoiceConnection;
    channel: TextChannel;
}
