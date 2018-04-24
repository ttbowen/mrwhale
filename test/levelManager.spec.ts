import { expect } from 'chai';
import { LevelManager } from '../src/client/managers/levelManager';

describe('LevelManager', () => {
    describe('levelToExp', () => {
        it('should calculate the correct experience from level', () => {
            const expectedExp = 155;
            const level = 1;

            expect(LevelManager.levelToExp(level)).to.equal(expectedExp);
        });
    });

    describe('getLevelFromExp', () => {
        it('should calculate the correct level from the given experience', () => {
            const expectedLevel = 1;
            const experience = 155;

            expect(LevelManager.getLevelFromExp(experience)).to.equal(expectedLevel);
        });
    });
});
