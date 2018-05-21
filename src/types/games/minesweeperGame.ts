import { MinesweeperOptions } from './minesweeperOptions';

/**
 * Represents a Minesweeper game.
 */
export class MinesweeperGame {
    private _ownerId: string;
    private _minefield: boolean[][];
    private _mineNeighborCount: number[][];
    private _flaggedTile: boolean[][];
    private _flaggedTileCount: number;
    private _revealedTiles: boolean[][];
    private _lost: boolean;
    private _totalTileCount: number;
    private _revealedTileCount: number;
    private _xTileSize: number;
    private _yTileSize: number;
    private _totalMineCount: number;
    private _startTime: number;
    private _gameDuration: number;

    constructor(options: MinesweeperOptions, owner: string) {
        this._xTileSize = options.gridXSize;
        this._yTileSize = options.gridYSize;
        this._totalMineCount = options.bombCount;
        this._gameDuration = options.gameDuration;
        this._lost = false;
        this._totalTileCount = this._xTileSize * this._yTileSize;
        this._revealedTileCount = 0;
        this._flaggedTileCount = 0;
        this._ownerId = owner;
        this._gameDuration = options.gameDuration;
    }

    private numToString(i: number): string {
        return (
            (i >= 26 ? this.numToString(((i / 26) >> 0) - 1) : '') +
            'abcdefghijklmnopqrstuvwxyz'[(i % 26) >> 0]
        );
    }

    private createPlayingField(xFieldSize: number, yFieldSize: number, mineCount: number): void {
        this._minefield = [];

        for (let x = 0; x < xFieldSize; x++) {
            this._minefield[x] = [];
            for (let y = 0; y < yFieldSize; y++) {
                this._minefield[x][y] = false;
            }
        }

        for (let i = 0; i < mineCount; i++) {
            const currentCoord: number[] = [
                Math.round(Math.random() * (xFieldSize - 1)),
                Math.round(Math.random() * (yFieldSize - 1))
            ];
            if (this._minefield[currentCoord[0]][currentCoord[1]] === true) {
                i--;
            } else {
                this._minefield[currentCoord[0]][currentCoord[1]] = true;
            }
        }

        this.populateNeighborCount();
        this.resetRevealedTilesList();
        this.resetFlaggedTilesList();
    }

    private resetRevealedTilesList(): void {
        this._revealedTiles = [];
        for (let x = 0; x < this._minefield[0].length; x++) {
            this._revealedTiles[x] = [];
            for (let y = 0; y < this._minefield[1].length; y++) {
                this._revealedTiles[x][y] = false;
            }
        }
    }

    revealAllTiles(): void {
        this._revealedTiles = [];
        for (let x = 0; x < this._minefield[0].length; x++) {
            this._revealedTiles[x] = [];
            for (let y = 0; y < this._minefield[1].length; y++) {
                this._revealedTiles[x][y] = true;
            }
        }
    }

    private resetFlaggedTilesList(): void {
        this._flaggedTile = [];
        for (let x = 0; x < this._minefield[0].length; x++) {
            this._flaggedTile[x] = [];
            for (let y = 0; y < this._minefield[1].length; y++) {
                this._flaggedTile[x][y] = false;
            }
        }
    }

    private populateNeighborCount(): void {
        this._mineNeighborCount = [];

        for (let x = 0; x < this._minefield[0].length; x++) {
            this._mineNeighborCount[x] = [];
            for (let y = 0; y < this._minefield[1].length; y++) {
                this._mineNeighborCount[x][y] = this.getNeighborCount(x, y);
            }
        }
    }

    private getNeighborCount(xPosition: number, yPosition: number): number {
        let neighborCount = 0;

        if (xPosition > 0) {
            if (this._minefield[xPosition - 1][yPosition] === true) {
                neighborCount++;
            }
            if (yPosition > 0) {
                if (this._minefield[xPosition - 1][yPosition - 1] === true) {
                    neighborCount++;
                }
            }
            if (yPosition < this._minefield[1].length - 1) {
                if (this._minefield[xPosition - 1][yPosition + 1] === true) {
                    neighborCount++;
                }
            }
        }
        if (xPosition < this._minefield[0].length - 1) {
            if (this._minefield[xPosition + 1][yPosition] === true) {
                neighborCount++;
            }
            if (yPosition > 0) {
                if (this._minefield[xPosition + 1][yPosition - 1] === true) {
                    neighborCount++;
                }
            }
            if (yPosition < this._minefield[1].length - 1) {
                if (this._minefield[xPosition + 1][yPosition + 1] === true) {
                    neighborCount++;
                }
            }
        }
        if (yPosition > 0) {
            if (this._minefield[xPosition][yPosition - 1] === true) {
                neighborCount++;
            }
        }
        if (yPosition < this._minefield[1].length - 1) {
            if (this._minefield[xPosition][yPosition + 1] === true) {
                neighborCount++;
            }
        }

        return neighborCount;
    }

    get playingFieldString(): string {
        let playingFieldString = '   ';

        for (let i = 0; i < this._mineNeighborCount[0].length; i++) {
            playingFieldString += i.toString().padEnd(3, ' ');
        }
        playingFieldString += '\n';

        for (let y = 0; y < this._minefield[1].length; y++) {
            playingFieldString += this.numToString(y)
                .toUpperCase()
                .padEnd(3, ' ');
            for (let x = 0; x < this._minefield[0].length; x++) {
                let charPad = '';
                if (this._revealedTiles[x][y]) {
                    if (this._minefield[x][y] === true) {
                        charPad = '☼';
                    } else if (this._mineNeighborCount[x][y] > 0) {
                        charPad = this._mineNeighborCount[x][y].toString();
                    } else {
                        charPad = '□';
                    }
                } else {
                    if (this._flaggedTile[x][y] === true) {
                        charPad = '►';
                    } else charPad = '■';
                }
                playingFieldString += charPad.padEnd(3, ' ');
            }
            playingFieldString += '\n';
        }

        return playingFieldString;
    }

    private revealAt(xPosition: number, yPosition: number): void {
        if (
            xPosition >= 0 &&
            yPosition >= 0 &&
            xPosition < this._minefield[0].length &&
            yPosition < this._minefield[1].length
        ) {
            this._revealedTileCount++;
            this._revealedTiles[xPosition][yPosition] = true;
            if (this._mineNeighborCount[xPosition][yPosition] > 0) {
                return;
            } else {
                if (xPosition > 0) {
                    if (this._revealedTiles[xPosition - 1][yPosition] === false) {
                        this.revealAt(xPosition - 1, yPosition);
                    }
                    if (yPosition > 0) {
                        if (this._revealedTiles[xPosition - 1][yPosition - 1] === false) {
                            this.revealAt(xPosition - 1, yPosition - 1);
                        }
                    }
                    if (yPosition < this._minefield[1].length - 1) {
                        if (this._revealedTiles[xPosition - 1][yPosition + 1] === false) {
                            this.revealAt(xPosition - 1, yPosition + 1);
                        }
                    }
                }
                if (xPosition < this._minefield[0].length - 1) {
                    if (this._revealedTiles[xPosition + 1][yPosition] === false) {
                        this.revealAt(xPosition + 1, yPosition);
                    }
                    if (yPosition > 0) {
                        if (this._revealedTiles[xPosition + 1][yPosition - 1] === false) {
                            this.revealAt(xPosition + 1, yPosition - 1);
                        }
                    }
                    if (yPosition < this._minefield[1].length - 1) {
                        if (this._revealedTiles[xPosition + 1][yPosition + 1] === false) {
                            this.revealAt(xPosition + 1, yPosition + 1);
                        }
                    }
                }
                if (yPosition > 0) {
                    if (this._revealedTiles[xPosition][yPosition - 1] === false) {
                        this.revealAt(xPosition, yPosition - 1);
                    }
                }
                if (yPosition < this._minefield[1].length - 1) {
                    if (this._revealedTiles[xPosition][yPosition + 1] === false) {
                        this.revealAt(xPosition, yPosition + 1);
                    }
                }
            }
        }
    }

    revealTile(xPosition: number, yPosition: number): void {
        if (
            xPosition >= 0 &&
            yPosition >= 0 &&
            xPosition < this._minefield[0].length &&
            yPosition < this._minefield[1].length
        ) {
            if (this._flaggedTile[xPosition][yPosition]) {
                return;
            }
            if (this._minefield[xPosition][yPosition]) {
                this._lost = true;
                return;
            }
        }
        this.revealAt(xPosition, yPosition);
    }

    flagTile(xPosition: number, yPosition: number): void {
        if (
            xPosition >= 0 &&
            yPosition >= 0 &&
            xPosition < this._minefield[0].length &&
            yPosition < this._minefield[1].length
        ) {
            if (this._revealedTiles[xPosition][yPosition]) {
                return;
            }
            this._flaggedTile[xPosition][yPosition] = true;
            this._flaggedTileCount++;
        }
    }

    unFlagTile(xPosition: number, yPosition: number): void {
        if (
            xPosition >= 0 &&
            yPosition >= 0 &&
            xPosition < this._minefield[0].length &&
            yPosition < this._minefield[1].length
        ) {
            this._flaggedTile[xPosition][yPosition] = false;
            this._flaggedTileCount--;
        }
    }

    get flaggedTileCount(): number {
        return this._flaggedTileCount;
    }

    forceLose(): void {
        this._lost = true;
    }

    get gameOver(): boolean {
        return this.won || this.lost;
    }

    get won(): boolean {
        return this._revealedTileCount === this._totalTileCount - this._totalMineCount;
    }

    get lost(): boolean {
        return this._lost;
    }

    get owner(): string {
        return this._ownerId;
    }

    get totalMineCount(): number {
        return this._totalMineCount;
    }

    get totalTileCount(): number {
        return this._totalTileCount;
    }

    get revealedTileCount(): number {
        return this._revealedTileCount;
    }

    isFlagged(xPosition: number, yPosition: number): boolean {
        return this._flaggedTile[xPosition][yPosition];
    }

    isRevealed(xPosition: number, yPosition: number): boolean {
        return this._revealedTiles[xPosition][yPosition];
    }

    get timeLeftString(): string {
        const timeLeft = this._gameDuration - (Date.now() - this._startTime) / 1000;
        return Math.round(timeLeft).toString();
    }

    get timedOut(): boolean {
        const timeDiff = (Date.now() - this._startTime) / 1000;
        return timeDiff > this._gameDuration;
    }

    get xTileSize(): number {
        return this._xTileSize;
    }
    get yTileSize(): number {
        return this._yTileSize;
    }

    /**
     * Start the hangman game.
     */
    start(): void {
        this.createPlayingField(this._xTileSize, this._yTileSize, this._totalMineCount);
        this._startTime = Date.now();
    }
}
