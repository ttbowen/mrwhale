import { Command, Message } from 'yamdbf';

import { BotClient } from '../../client/botClient';
import { Database } from '../../database/database';
import { Dictionary } from '../../entity/dictionary';
import { User } from '../../entity/user';
import { moderatorOnly } from '../../util/decorators/moderation';
import { prompt, PromptResult } from '../../util/prompt';
import { truncate } from '../../util/truncate';

export default class extends Command<BotClient> {
  constructor() {
    super({
      name: 'chdef',
      desc: 'Change a definition for the `define` command.',
      usage: '<prefix>chdef <word>',
      group: 'useful'
    });
  }

  @moderatorOnly
  async action(message: Message, args: string[]): Promise<any> {
    const word: string = args.join(' ').toLowerCase();
    const defMax = 1500;
    const exampleMax = 400;
    const time = 20000;

    message.channel.send(`Please enter a new definition for ${word}.`);

    const newDef: Message = (await message.channel.awaitMessages(
      a => a.author.id === message.author.id,
      { max: 1, time: time }
    )).first();

    if (!newDef) return message.channel.send('Command timed out');

    const dictionary: Dictionary = new Dictionary();
    dictionary.definition = truncate(defMax, newDef.content);
    dictionary.word = word;

    const result: PromptResult = await prompt(
      message,
      'Enter a new example for this definition? Enter yes or no.',
      'yes',
      'no'
    );

    if (result === PromptResult.SUCCESS) {
      message.channel.send(`Enter an example for ${word}.`);

      const newExample: Message = (await message.channel.awaitMessages(
        a => a.author.id === message.author.id,
        { max: 1, time }
      )).first();

      if (newExample) dictionary.example = truncate(exampleMax, newExample.content);
    }

    const foundWord: Dictionary = await Database.connection
      .getRepository(Dictionary)
      .findOne({ guildId: message.guild.id, word: word });

    if (foundWord) dictionary.id = foundWord.id;

    dictionary.guildId = message.guild.id;
    dictionary.user = new User();
    dictionary.user.id = message.author.id;

    Database.connection.getRepository(Dictionary).save(dictionary);

    return message.channel.send('Successfully changed definition.');
  }
}
