import { expect } from 'chai';
import { GuessResult } from '../src/types/games/guessResult';
import { HangmanGame } from '../src/types/games/hangmanGame';

const fsmock = require('mock-fs');

describe('HangmanGame', () => {
    beforeEach(() => {
        fsmock({
            'src/data/static/': {
                'hangman.json': '["word", "otherword"]'
            }
        });
    });
    afterEach(fsmock.restore);

    describe('loadWords', () => {
        it('should load the dictionary', async () => {
            const words = await HangmanGame.loadWords();
            const expectedLength = 2;

            expect(words).to.be.an('array').to.be.not.empty;
            expect(words).lengthOf(expectedLength);
        });
    });

    describe('gameOver', () => {
        it('should flag the game as over', () => {
            const game = new HangmanGame({
                lives: 3,
                ownerId: '12345'
            });
            game.start();
            game.gameOver();

            expect(game.isGameOver).to.be.true;
        });

        it('should return the correct win status', () => {
            const game = new HangmanGame({
                lives: 3,
                ownerId: '12345'
            });
            game.start();

            expect(game.gameOver(true)).to.be.true;
            expect(game.gameOver(false)).to.be.false;
        });
    });

    describe('getLettersToShow', () => {
        it('should return the correct letters for selected word', async () => {
            const game = new HangmanGame({
                lives: 3,
                ownerId: '1245'
            });
            await game.start();
            const currentWord: string = game.currentWord.toLowerCase();
            const guesses: string[] = [currentWord[0], currentWord[1]];
            game.guess(guesses[0]);
            game.guess(guesses[1]);

            const actual: string[] = game.getLettersToShow();

            expect(actual[0].toLowerCase()).equals(guesses[0]);
            expect(actual[1].toLowerCase()).equals(guesses[1]);
        });
    });

    describe('guess', () => {
        it('should return GuessResult.Correct with the correct letter', async () => {
            const game = new HangmanGame({
                lives: 3,
                ownerId: '1245'
            });
            await game.start();
            const currentWord: string = game.currentWord;

            const result: GuessResult = game.guess(game.currentWord[0]);

            expect(result).to.equal(GuessResult.Correct);
        });

        it('should return GuessResult.Incorrect with the incorrect letter', async () => {
            const game = new HangmanGame({
                lives: 3,
                ownerId: '1245'
            });
            await game.start();
            const currentWord: string = game.currentWord;
            const incorrectLetter = 'z';

            const result: GuessResult = game.guess(incorrectLetter);

            expect(result).to.equal(GuessResult.Incorrect);
        });

        it('should return GuessResult.Invalid when an invalid letter is passed', async () => {
            const game = new HangmanGame({
                lives: 3,
                ownerId: '1245'
            });
            await game.start();
            const currentWord: string = game.currentWord;
            const invalidChars = '@#*';

            expect(game.guess(invalidChars[0])).to.equal(GuessResult.Invalid);
            expect(game.guess(invalidChars[1])).to.equal(GuessResult.Invalid);
            expect(game.guess(invalidChars[2])).to.equal(GuessResult.Invalid);
        });

        it('should return GuessResult.Guessed when letter has already been guessed', async () => {
            const game = new HangmanGame({
                lives: 3,
                ownerId: '1245'
            });
            await game.start();
            const currentWord: string = game.currentWord;

            game.guess('a');
            const guess: GuessResult = game.guess('a');

            expect(guess).to.equal(GuessResult.Guessed);
        });
    });
});
