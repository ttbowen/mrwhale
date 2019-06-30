import { Message } from 'discord.js';
import { Command } from 'yamdbf';

import { BotClient } from '../../client/botClient';

/**
 * Decorator to set commands to moderater only.
 * @param target
 * @param key
 * @param descriptor
 */
export function moderatorOnly(
  target: Command<BotClient>,
  key: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const original = descriptor.value;
  descriptor.value = async function(message: Message, args: any[]): Promise<void> {
    const canCall = await (this as Command<BotClient>).client.moderation.canCallCommand(message);
    if (!canCall) (this as Command<BotClient>).client.moderation.error(message);
    else return await original.apply(this, [message, args]);
  };
  return descriptor;
}
