import { expect } from 'chai';
import { HangmanGame } from '../src/types/games/HangmanGame';
import { GuessResult } from '../src/types/games/guessResult';

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
        it('should return the correct result', async () => {
            const game = new HangmanGame({
                lives: 3,
                ownerId: '1245'
            });
            await game.start();
            const currentWord: string = game.currentWord;

            expect(game.guess(currentWord[0])).to.equal(GuessResult.Correct);
            expect(game.guess('z')).to.equal(GuessResult.Incorrect);
        });
    });
});
