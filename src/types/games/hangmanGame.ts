import * as fs from 'fs';
import * as path from 'path';
import { GuessResult } from './guessResult';
import { HangmanOptions } from './hangmanOptions';

/**
 * Represents a hangman game.
 */
export class HangmanGame {
    private _lettersGuessed: string;
    private _lettersMatched: string;
    private _numLettersMatched: number;
    private _lettersToShow: string[];
    private _currentWord: string;
    private _lives: number;
    private _won: boolean;
    private _isGameOver: boolean;
    private _startTime: number;
    private _ownerId: string;

    get lives(): number {
        return this._lives;
    }

    get won(): boolean {
        return this._won;
    }

    get currentWord(): string {
        return this._currentWord;
    }

    get startTime(): number {
        return this._startTime;
    }

    get isGameOver(): boolean {
        return this._isGameOver;
    }

    get lettersGuessed(): string {
        return this._lettersGuessed;
    }

    /**
     * Creates an instance of {@link HangmanGame}.
     * @param options The game options.
     */
    constructor(options: HangmanOptions) {
        this._lettersGuessed = '';
        this._lettersMatched = '';
        this._numLettersMatched = 0;
        this._lives = options.lives;
        this._isGameOver = false;
        this._won = false;
        this._ownerId = options.ownerId;
    }

    /**
     * Loads the hangman dictionary.
     */
    static async loadWords(): Promise<any> {
        const wordsPath = path.join(__dirname, '../../data/static/hangman.json');
        return new Promise<any>((resolve, reject) => {
            fs.readFile(wordsPath, 'utf8', (err, data) => {
                if (err) reject(err);
                else resolve(JSON.parse(data));
            });
        });
    }

    /**
     * Guess a letter for current word.
     * @param letter The letter to guess.
     */
    guess(letter: string): GuessResult {
        letter = letter.trim().toLowerCase();

        if (
            (this._lettersGuessed && this._lettersGuessed.indexOf(letter) > -1) ||
            (this._lettersMatched && this._lettersMatched.indexOf(letter) > -1)
        ) {
            return GuessResult.Correct;
        } else if (this._currentWord.indexOf(letter) > -1) {
            for (let i = 0; i < this._currentWord.length; i++) {
                if (this._currentWord.charAt(i) === letter) {
                    this._numLettersMatched++;
                }
            }
            this._lettersMatched += letter;

            return GuessResult.Correct;
        } else {
            this._lettersGuessed += letter;
            this._lives--;

            return GuessResult.Incorrect;
        }
    }

    /**
     * End the current game.
     * @param [won] Whether the game was a win.
     */
    gameOver(won?: boolean): boolean {
        this._won = won;
        this._isGameOver = true;

        if (won) return true;
        else return false;
    }

    /**
     * Return the guessed letters.
     */
    getLettersToShow(): string[] {
        const output = [];

        for (let i = 0; i < this._currentWord.length; i++) {
            output[i] = '\\_';
        }

        for (let i = 0; i < this._lettersMatched.length; i++) {
            const char = this._lettersMatched.charAt(i);
            for (let j = 0; j < this._currentWord.length; j++) {
                if (this._currentWord.charAt(j) === char) {
                    output[j] = char.toUpperCase();
                }
            }
        }
        return output;
    }

    /**
     * Start the hangman game.
     */
    async start(): Promise<void> {
        const dictionary = await HangmanGame.loadWords();
        this._currentWord = dictionary[Math.floor(Math.random() * dictionary.length)];
        this._startTime = Date.now();
    }
}
