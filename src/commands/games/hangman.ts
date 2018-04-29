import { Collection } from 'discord.js';
import { Command, Message } from 'yamdbf';
import { BotClient } from '../../client/botClient';
import * as hangmanPics from '../../data/hangmanPics';
import { GuessResult } from '../../types/games/guessResult';
import { HangmanGame } from '../../types/games/hangmanGame';

export default class extends Command<BotClient> {
    private _games: Collection<string, HangmanGame>;
    private readonly _livesStart: number;

    constructor() {
        super({
            name: 'hangman',
            desc: 'Play the class game of hangman.',
            usage: '<prefix>hangman <start|guess|end>',
            aliases: ['hm', 'guess'],
            group: 'games',
            ratelimit: '4/30s',
            guildOnly: true
        });
        this._games = new Collection<string, HangmanGame>();
        this._livesStart = 8;
    }

    private async start(
        message: Message,
        ownerId: string,
        channelId: string
    ): Promise<Message | Message[]> {
        if (this._games.has(channelId))
            return message.channel.send('There is already an active game for this channel.');

        const newGame = new HangmanGame({
            ownerId: ownerId,
            lives: this._livesStart
        });
        await newGame.start();
        this._games.set(channelId, newGame);
        const letters: string[] = newGame.getLettersToShow();
        let gameStartMessage = `I'm thinking of a **${
            newGame.currentWord.length
        }** lettered word. Start guessing.\n`;

        gameStartMessage += this.printLetters(newGame);

        return message.channel.send(gameStartMessage);
    }

    private printLetters(game: HangmanGame): string {
        const letters: string[] = game.getLettersToShow();
        let printedLetters = '';
        for (const letter of letters) {
            printedLetters += letter + ' ';
        }
        return printedLetters;
    }

    private gameTimeout(channelId: string, game: HangmanGame): boolean {
        const diff: number = (Date.now() - this._games.get(channelId).startTime) / 1000;
        if (diff > 500) {
            this._games.delete(channelId);
            return true;
        }
        return false;
    }

    private drawPic(game: HangmanGame, index: number): string {
        const pics: string[][] = hangmanPics.default;
        let pic = 'HANGMAN\n';
        for (let i = 0; i < pics[index].length; i++) {
            pic += pics[index][i] + '\n';
        }
        pic += `Guessed: ${game.lettersGuessed.replace('', ' ')}\n`;
        pic += `Attempts Left: ${game.lives}`;

        return pic;
    }

    private guess(message: Message, guess: string): Promise<Message | Message[]> {
        const channelId: string = message.channel.id;
        if (!this._games.has(channelId))
            return message.channel.send('There is no game in progress for this channel.');

        const game: HangmanGame = this._games.get(channelId);
        const picToshow = this._livesStart - game.lives;

        if (!guess) return message.channel.send('Please provide a guess.');

        if (game.isGameOver)
            return message.channel.send('Game is over. You cannot make another guess.');

        if (this.gameTimeout(channelId, game))
            return message.channel.send('The game has ended. use `start` to begin another game.');

        const guessResult: GuessResult = game.guess(guess[0]);

        if (game.lives === 0) {
            game.gameOver(false);
            return message.channel.send(
                `\`\`\`\n${this.drawPic(
                    game,
                    picToshow
                )}\nGame Over! Your man has been hanged x__x The word was ${game.currentWord}\`\`\``
            );
        }

        if (guessResult === GuessResult.Guessed)
            return message.channel.send(`${guess} has already been guessed`);

        if (guessResult === GuessResult.Invalid)
            return message.channel.send('Please pass a valid letter.');

        if (guessResult === GuessResult.Correct) {
            if (game.lettersMatchedNum === game.currentWord.length) {
                game.gameOver(true);
                return message.channel.send(`${this.printLetters(game)}\nYou win!`);
            }
            return message.channel.send(`Correct guess!\n${this.printLetters(game)}`);
        }

        if (guessResult === GuessResult.Incorrect)
            return message.channel.send(
                `\`\`\`\n${this.drawPic(game, picToshow)}\nIncorrect guess. You have ${
                    game.lives
                } remaining.\`\`\``
            );
    }

    private end(
        message: Message,
        authorId: string,
        channelId: string
    ): Promise<Message | Message[]> {
        if (this._games.get(channelId).ownerId !== authorId)
            return message.reply('You must be the owner of this game to end it.');

        if (!this._games.has(channelId) || this._games.get(channelId).isGameOver)
            return message.channel.send('There is no game in progress for this channel.');

        this._games.get(channelId).gameOver(false);

        return message.channel.send('Game ended. You lose.');
    }

    async action(message: Message, args: any[]): Promise<any> {
        const channelId: string = message.channel.id;
        const authorId: string = message.author.id;

        if (this._games.has(channelId)) {
            if (this._games.get(channelId).won || this._games.get(channelId).isGameOver)
                this._games.delete(channelId);
        }

        const prefix: string = await this.client.getPrefix(message.guild);

        if (message.content.startsWith(`${prefix}guess`)) return this.guess(message, args[0]);

        if (!args[0]) return message.channel.send('Please provide a command.');

        if (args[1]) args[1] = args[1].toLowerCase();

        if (args && args[0] === 'start') this.start(message, authorId, channelId);
        else if (args && args[0] === 'guess') this.guess(message, args[1]);
        else if (args && args[0] === 'end') this.end(message, authorId, channelId);
    }
}
