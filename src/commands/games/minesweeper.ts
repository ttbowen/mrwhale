import { Collection } from 'discord.js';
import { Command, Message } from 'yamdbf';

import { BotClient } from '../../client/botClient';
import { lose, win } from '../../data/minesweeper';
import { MinesweeperGame } from '../../types/games/minesweeperGame';
import { MinesweeperOptions } from '../../types/games/minesweeperOptions';

export default class extends Command<BotClient> {
    private _games: Collection<string, MinesweeperGame>;

    constructor() {
        super({
            name: 'minesweeper',
            desc: 'Play minesweeper. A classic.',
            usage:
                '<prefix>minesweeper <start <easy|medium|hard>|end>, ' +
                'After starting a game, use <prefix>reveal to reveal a tile,' +
                '<prefix>flag to flag a tile, and <prefix>unflag to unflag a tile',
            aliases: ['flag', 'unflag', 'reveal'],
            group: 'games',
            ratelimit: '10/30s',
            guildOnly: true
        });
        this._games = new Collection<string, MinesweeperGame>();
    }

    private convertLetterToNumber(str: string): number {
        str = str.toUpperCase();
        let out = 0;
        const len = str.length;
        for (let pos = 0; pos < len; pos++) {
            out += (str.charCodeAt(pos) - 65) * Math.pow(26, len - pos - 1);
        }
        return out;
    }

    private async startGame(message: Message, args: any[]): Promise<any> {
        const channelId: string = message.channel.id;
        const authorId: string = message.author.id;

        if (this._games.has(channelId)) {
            return message.channel.send(
                'A game of minesweeper is already running on this channel!'
            );
        } else {
            if (args.length < 2) {
                const gameOption: MinesweeperOptions = {
                    gridXSize: 15,
                    gridYSize: 15,
                    bombCount: 15,
                    gameDuration: 400
                };
                const game: MinesweeperGame = new MinesweeperGame(gameOption, authorId);
                this._games.set(channelId, game);
                game.start();
            } else if (args[1].toString().toLowerCase() === 'easy') {
                const gameOption: MinesweeperOptions = {
                    gridXSize: 10,
                    gridYSize: 10,
                    bombCount: 10,
                    gameDuration: 360
                };
                const game: MinesweeperGame = new MinesweeperGame(gameOption, authorId);
                this._games.set(channelId, game);
                game.start();
            } else if (args[1].toString().toLowerCase() === 'medium') {
                const gameOption: MinesweeperOptions = {
                    gridXSize: 15,
                    gridYSize: 15,
                    bombCount: 20,
                    gameDuration: 600
                };
                const game: MinesweeperGame = new MinesweeperGame(gameOption, authorId);
                this._games.set(channelId, game);
                game.start();
            } else if (args[1].toString().toLowerCase() === 'hard') {
                const gameOption: MinesweeperOptions = {
                    gridXSize: 20,
                    gridYSize: 20,
                    bombCount: 35,
                    gameDuration: 900
                };
                const game: MinesweeperGame = new MinesweeperGame(gameOption, authorId);
                this._games.set(channelId, game);
                game.start();
            } else {
                return message.channel.send(
                    'Please pass in a valid difficulty modifier or none at all!' +
                        '\nvalid difficulties: easy | normal | hard'
                );
            }

            return message.channel.send(this.constructGameScreen(this._games.get(channelId)));
        }
    }

    private async endGame(message: Message): Promise<Message | Message[]> {
        const channelId: string = message.channel.id;
        const authorId: string = message.author.id;
        if (this._games.has(channelId)) {
            const game: MinesweeperGame = this._games.get(channelId);
            if (game.owner !== authorId) {
                return message.channel.send('You have to be the game starter to end the game!');
            } else {
                game.forceLose();
                game.revealAllTiles();
                message.channel.send('```' + game.playingFieldString + '```');
                message.channel.send(
                    'You revealed ' +
                        game.revealedTileCount.toString() +
                        ' out of ' +
                        game.totalTileCount.toString() +
                        ' tile.'
                );
                const lossModifier = lose[Math.round(Math.random() * (lose.length - 1))];
                return message.channel.send('Game finished... You lost. ' + lossModifier);
            }
        } else {
            return message.channel.send("You can't end the game when no game is running.");
        }
    }

    private constructGameScreen(game: MinesweeperGame): string {
        let str = '```' + game.playingFieldString;

        str +=
            '\nTile left: ' +
            (game.totalTileCount - game.totalMineCount - game.revealedTileCount).toString() +
            ' | Uncovered tile: ' +
            game.revealedTileCount.toString();
        str +=
            '\nTotal tile count: ' +
            game.totalTileCount.toString() +
            ' | There is ' +
            game.totalMineCount.toString() +
            ' mines';
        str += '\nYou flagged ' + game.flaggedTileCount.toString() + ' tile';
        str += '\nYou have ' + game.timeLeftString + ' seconds left!```';

        return str;
    }

    private async reveal(message: Message, args: any[]): Promise<any> {
        const channelId: string = message.channel.id;
        if (!this._games.has(channelId)) {
            return message.channel.send('No game of minesweeper is running on this channel!');
        }

        const game: MinesweeperGame = this._games.get(channelId);

        const prefix: string = await this.client.getPrefix(message.guild);

        let xTilePos = 0;
        try {
            xTilePos = parseInt(args[0].toString(), 10);
        } catch {
            return message.channel
                .send(`Please provide a valid coordinate. (${prefix}flag <number> <letter>) \n' +
                                        'ex: ${prefix}reveal 5 b`);
        }

        let yTilePos = 0;
        try {
            yTilePos = this.convertLetterToNumber(args[1].toString());
        } catch {
            return message.channel
                .send(`Please provide a valid coordinate. (${prefix}flag <number> <letter>) \n' +
                                        'ex: ${prefix}reveal 5 b`);
        }

        if (
            xTilePos >= game.xTileSize ||
            yTilePos >= game.yTileSize ||
            xTilePos < 0 ||
            yTilePos < 0
        ) {
            return message.channel.send(
                'Please provide a valid coordinate.' +
                    'The coordinate you passed in is not in the board!'
            );
        }

        if (game.isFlagged(xTilePos, yTilePos)) {
            return message.channel.send(`That tile is flagged! No revealing a flagged tile!`);
        }

        if (game.isRevealed(xTilePos, yTilePos)) {
            return message.channel.send(`That tile is already revealed!`);
        }

        game.revealTile(xTilePos, yTilePos);

        if (game.gameOver) {
            if (game.won) {
                game.revealAllTiles();
                message.channel.send('```' + game.playingFieldString + '```');
                const winModifier = win[Math.round(Math.random() * (win.length - 1))];
                return message.channel.send('Game finished... You won! ' + winModifier);
            } else if (game.lost) {
                game.revealAllTiles();
                message.channel.send('```' + game.playingFieldString + '```');
                message.channel.send(
                    'You revealed ' +
                        game.revealedTileCount.toString() +
                        ' out of ' +
                        game.totalTileCount.toString() +
                        ' tile.'
                );
                const lossModifier = lose[Math.round(Math.random() * (lose.length - 1))];
                return message.channel.send('Game finished... You lost. ' + lossModifier);
            }
        }

        return message.channel.send(this.constructGameScreen(game));
    }

    private async flag(message: Message, args: any[]): Promise<any> {
        const channelId: string = message.channel.id;
        if (!this._games.has(channelId)) {
            return message.channel.send('No game of minesweeper is running on this channel!');
        }

        const game: MinesweeperGame = this._games.get(channelId);

        const prefix: string = await this.client.getPrefix(message.guild);

        let xTilePos = 0;
        try {
            xTilePos = parseInt(args[0].toString(), 10);
        } catch {
            return message.channel
                .send(`Please provide a valid coordinate. (${prefix}flag <number> <letter>) \n'+
                                        'ex: ${prefix}flag 5 b`);
        }

        let yTilePos = 0;
        try {
            yTilePos = this.convertLetterToNumber(args[1].toString());
        } catch {
            return message.channel
                .send(`Please provide a valid coordinate. (${prefix}flag <number> <letter>) \n'+
                                        'ex: ${prefix}flag 5 b`);
        }

        if (
            xTilePos >= game.xTileSize ||
            yTilePos >= game.yTileSize ||
            xTilePos < 0 ||
            yTilePos < 0
        ) {
            return message.channel.send(
                'Please provide a valid coordinate.' +
                    'The coordinate you passed in is not in the board!'
            );
        }

        if (game.isRevealed(xTilePos, yTilePos)) {
            return message.channel.send(`That tile is already revealed! It can't be flagged.`);
        }

        if (game.isFlagged(xTilePos, yTilePos)) {
            return message.channel.send(`That tile is already flagged!`);
        }

        game.flagTile(xTilePos, yTilePos);

        return message.channel.send(this.constructGameScreen(game));
    }

    private async unflag(message: Message, args: any[]): Promise<any> {
        const channelId: string = message.channel.id;
        if (!this._games.has(channelId)) {
            return message.channel.send('No game of minesweeper is running on this channel!');
        }

        const game: MinesweeperGame = this._games.get(channelId);

        const prefix: string = await this.client.getPrefix(message.guild);

        let xTilePos = 0;
        try {
            xTilePos = parseInt(args[0].toString(), 10);
        } catch {
            return message.channel
                .send(`Please provide a valid coordinate. (${prefix}flag <number> <letter>) \n'+
                                        'ex: ${prefix}unflag 5 b`);
        }

        let yTilePos = 0;
        try {
            yTilePos = this.convertLetterToNumber(args[1].toString());
        } catch {
            return message.channel
                .send(`Please provide a valid coordinate. (${prefix}flag <number> <letter>) \n'+
                                        'ex: ${prefix}unflag 5 b`);
        }

        if (
            xTilePos >= game.xTileSize ||
            yTilePos >= game.yTileSize ||
            xTilePos < 0 ||
            yTilePos < 0
        ) {
            return message.channel.send(
                'Please provide a valid coordinate.' +
                    'The coordinate you passed in is not in the board!'
            );
        }

        if (game.isRevealed(xTilePos, yTilePos)) {
            return message.channel.send(`That tile is already revealed! It can't be unflagged.`);
        }

        if (!game.isFlagged(xTilePos, yTilePos)) {
            return message.channel.send(`That tile is already unflagged!`);
        }

        game.unFlagTile(xTilePos, yTilePos);

        return message.channel.send(this.constructGameScreen(game));
    }

    async action(message: Message, args: any[]): Promise<any> {
        const channelId: string = message.channel.id;
        const authorId: string = message.author.id;
        const prefix: string = await this.client.getPrefix(message.guild);

        if (this._games.has(channelId)) {
            const game = this._games.get(channelId);
            if (game.timedOut) {
                if (message.content.startsWith(`${prefix}minesweeper`)) {
                    message.channel.send('Last game is timed out! Starting new game...');
                    game.forceLose();
                } else {
                    message.channel.send("Time's up!");
                    return this.endGame(message);
                }
            }
            if (game.gameOver) this._games.delete(channelId);
        }

        if (message.content.startsWith(`${prefix}reveal`)) {
            if (this._games.has(channelId)) {
                if (args.length < 2) {
                    return message.channel.send(
                        `Please provide a valid coordinate. (${prefix}reveal <number> <letter>) \n` +
                            `ex: ${prefix}reveal 15 c`
                    );
                }
                return this.reveal(message, args);
            } else {
                return message.channel.send('No game of minesweeper is underway');
            }
        }

        if (message.content.startsWith(`${prefix}flag`)) {
            if (this._games.has(channelId)) {
                if (args.length < 2) {
                    return message.channel.send(
                        `Please provide a valid coordinate. (${prefix}flag <number> <letter>) \n` +
                            `ex: ${prefix}reveal 1 aa`
                    );
                }
                return this.flag(message, args);
            } else {
                return message.channel.send('No game of minesweeper is underway');
            }
        }

        if (message.content.startsWith(`${prefix}unflag`)) {
            if (this._games.has(channelId)) {
                if (args.length < 2) {
                    return message.channel.send(
                        `Please provide a valid coordinate. (${prefix}unflag <number> <letter>) \n` +
                            `ex: ${prefix}reveal 14 ac`
                    );
                }
                return this.unflag(message, args);
            } else {
                return message.channel.send('No game of minesweeper is underway');
            }
        }

        if (!args[0]) return message.channel.send('Please provide a command.');

        if (args && args[0] === 'start') this.startGame(message, args);
        else if (args && args[0] === 'end') this.endGame(message);
    }
}
