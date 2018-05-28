import { Message } from 'discord.js';
import { Command } from 'yamdbf';

import { BotClient } from '../../client/botClient';

/**
 * Decorator to limit users to use a command with the music role only.
 * @param target
 * @param key
 * @param descriptor
 */
export function musicRoleOnly(
    target: Command<BotClient>,
    key: string,
    descriptor: PropertyDescriptor
): PropertyDescriptor {
    const original = descriptor.value;
    descriptor.value = async function(message: Message, args: any[]): Promise<void> {
        const canCall = await (this as Command<BotClient>).client.musicPlayer.canCallMusicCommand(
            message
        );
        if (!canCall) (this as Command<BotClient>).client.musicPlayer.error(message);
        else return await original.apply(this, [message, args]);
    };
    return descriptor;
}
