import { expect } from 'chai';
import { LevelManager } from '../../src/client/managers/levelManager';

describe('LevelManager', () => {
  describe('levelToExp', () => {
    it('should calculate the correct experience from level', () => {
      const firstExpectedExp = 155;
      const secondExpectedExp = 220;

      expect(LevelManager.levelToExp(1)).to.equal(firstExpectedExp);
      expect(LevelManager.levelToExp(2)).to.equal(secondExpectedExp);
    });
  });

  describe('getLevelFromExp', () => {
    it('should calculate the correct level from the given experience', () => {
      const expectedLevel = 1;
      const secondExpectedLevel = 2;

      expect(LevelManager.getLevelFromExp(155)).to.equal(expectedLevel);
      expect(LevelManager.getLevelFromExp(320)).to.equal(secondExpectedLevel);
    });
  });
});
