import { Collection, RichEmbed } from 'discord.js';
import { Command, Lang, Message, ResourceLoader, Util } from 'yamdbf';
import { BotClient } from '../client/botClient';

const resource: ResourceLoader = Lang.createResourceLoader('en_gb');

export default class extends Command<BotClient> {
    constructor() {
        super({
            name: 'help',
            desc: 'Provides info on bot commands.',
            usage: '<prefix>help [command]',
            info:
                'Will DM command help information to the user to keep clutter down in guild channels',
            overloads: 'help'
        });
    }

    async action(message: Message, [commandName]: [string]): Promise<any> {
        const dm: boolean = message.channel.type === 'dm' || message.channel.type === 'group';
        const prefix: string = !dm ? await message.guild.storage.settings.get('prefix') : '';
        const lang: string = dm
            ? this.client.defaultLang
            : await message.guild.storage.settings.get('lang');
        const commandGroups = ['fun', 'games', 'info', 'level', 'mod', 'music', 'useful', 'base'];
        let command: Command;
        let output = '';
        const embed = new RichEmbed();

        if (!commandName) {
            let commandList = '';
            const data = {
                commandList: commandList,
                usage: Lang.getCommandInfo(this, lang).usage,
                mentionUsage: Lang.getCommandInfo(this, lang).usage.replace(
                    '<prefix>',
                    `@${this.client.user.tag}`
                )
            };

            for (let i = 0; i < commandGroups.length; i++) {
                const mappedCommands = this.getMappedGroupCommands(message, commandGroups[i]);
                commandList += `${
                    commandGroups[i] === 'base' ? 'OTHER' : commandGroups[i].toUpperCase()
                } COMMANDS: `;
                commandList += '\n';

                for (let j = 0; j < mappedCommands.length; j++) {
                    commandList += `${mappedCommands[j]}`;
                    commandList += '\n';
                }
                commandList += '\n';
            }
            data.commandList = commandList;
            output = resource('CMD_HELP_COMMAND_LIST', data);
        } else {
            {
                command = this.client.commands
                    .filter(
                        c => !c.disabled && !(!this.client.isOwner(message.author) && c.ownerOnly)
                    )
                    .find(c => c.name === commandName || c.aliases.includes(commandName));

                if (!command) output = resource('CMD_HELP_UNKNOWN_COMMAND');
                else {
                    const info: any = Lang.getCommandInfo(command, lang);

                    output = resource('CMD_HELP_CODEBLOCK', {
                        serverOnly: command.guildOnly ? resource('CMD_HELP_SERVERONLY') : '',
                        ownerOnly: command.ownerOnly ? resource('CMD_HELP_OWNERONLY') : '',
                        commandName: command.name,
                        desc: info.desc,
                        aliasText:
                            command.aliases.length > 0
                                ? resource('CMD_HELP_ALIASES', {
                                      aliases: command.aliases.join(', ')
                                  })
                                : '',
                        usage: info.usage,
                        info: info.info ? `\n${info.info}` : ''
                    });
                }
            }
        }

        output = dm
            ? output.replace(/<prefix>/g, '')
            : output.replace(/<prefix>/g, (await this.client.getPrefix(message.guild)) || '');
        embed.setColor(7911109).setDescription(output);
        let outMessage: Message;
        try {
            if (this.client.selfbot)
                outMessage = (await message.channel.send({ embed })) as Message;
            else await message.author.send({ embed });
            if (!dm && !this.client.selfbot) {
                if (command) message.reply(resource('CMD_HELP_REPLY_CMD'));
                else message.reply(resource('CMD_HELP_REPLY_ALL'));
            }
        } catch (err) {
            if (!dm && !this.client.selfbot) message.reply(resource('CMD_HELP_REPLY_FAIL'));
        }

        if (outMessage) outMessage.delete(30e3);
    }

    private getMappedGroupCommands(message: Message, group: string): string[] {
        const usableCommands: Collection<string, Command> = this.client.commands
            .filter(c => !(!this.client.isOwner(message.author) && c.ownerOnly))
            .filter(c => c.group === group)
            .filter(c => !c.hidden && !c.disabled);

        const widestCmd: number = usableCommands
            .map(c => c.name.length)
            .reduce((a, b) => Math.max(a, b));

        const mappedCommands: string[] = usableCommands
            .sort((a, b) => (a.name < b.name ? -1 : 1))
            .map(c => (c.guildOnly ? '*' : ' ') + Util.padRight(c.name, widestCmd + 2));

        return mappedCommands;
    }
}
