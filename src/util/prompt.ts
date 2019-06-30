import { Message } from 'discord.js';

/**
 * Contains Prompt responses.
 */
export enum PromptResult {
  TIMEOUT,
  SUCCESS,
  FAILURE
}

/**
 * Provide a user with a prompt message.
 * @param message The current message.
 * @param promptMsg The prompt message text.
 * @param success Accept option.
 * @param failure  Decline option.
 */
export async function prompt(
  message: Message,
  promptMsg: string,
  success: string,
  failure: string
): Promise<PromptResult> {
  message.channel.send(promptMsg);
  success = success.toLowerCase().trim();
  failure = failure.toLowerCase().trim();

  const confirm: Message = (await message.channel.awaitMessages(
    a =>
      a.author.id === message.author.id &&
      (success === a.content.toLowerCase().trim() || failure === a.content.toLowerCase().trim()),
    { max: 1, time: 20000 }
  )).first();

  if (!confirm) return PromptResult.TIMEOUT;
  if (success !== confirm.content) return PromptResult.FAILURE;

  return PromptResult.SUCCESS;
}
