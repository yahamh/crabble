import { Injectable } from '@angular/core';
import { EMPTY_CHAR } from '@app/game-logic/constants';
import { Direction } from '@app/game-logic/direction.enum';
import { BoardService } from '@app/game-logic/game/board/board.service';
import { Letter } from '@app/game-logic/game/board/letter.interface';
import { GameInfoService } from '@app/game-logic/game/game-info/game-info.service';
import { GameSocketHandlerService } from '@app/socket-handler/game-socket-handler/game-socket-handler.service';

@Injectable({
    providedIn: 'root'
})
export class DragAndDropService {

    movingLetter: {letter: Letter, index: number} | undefined;
    placedLetters: {letter: Letter, index: number, x: number, y: number}[] = []

    get placedLettersInOrder(): {keyStrokes: string[], direction: Direction, pos: {x: number, y:number}} | undefined {
        let minX = Math.min(...this.placedLetters.map(value => value.x));
        let minY = Math.min(...this.placedLetters.map(value => value.y));
        let maxX = Math.max(...this.placedLetters.map(value => value.x));
        let maxY = Math.max(...this.placedLetters.map(value => value.y));

        if(minX == maxX) {
            return {
                keyStrokes: this.placedLetters.sort((a, b) => a.y - b.y).map(value => value.letter.isJoker ? value.letter.char.toUpperCase() : value.letter.char.toLowerCase()),
                direction: Direction.Vertical,
                pos: {
                    x: minX,
                    y: minY
                }
            }
        }
        else if(minY == maxY) {
            return {
                keyStrokes: this.placedLetters.sort((a, b) => a.x - b.x).map(value => value.letter.isJoker ? value.letter.char.toUpperCase() : value.letter.char.toLowerCase()),
                direction: Direction.Horizontal,
                pos: {
                    x: minX,
                    y: minY
                }
            }
        }

        return undefined;
    }

    constructor(private boardService: BoardService, private gameService: GameInfoService, private gameSocket: GameSocketHandlerService) {
        this.gameService.endTurn$.subscribe(() => {
            this.placedLetters = []
            this.movingLetter = undefined
        })
    }

    cancel() {
        for (const letter of this.placedLetters) {
            this.boardService.board.resetTile(letter.x, letter.y)
        }
        this.placedLetters = []
        this.gameSocket.destroyFirstMove()
    }

    isPlacementRight(): boolean {
        if(this.placedLetters.length == 0) {
            return false;
        }

        let pos = {x: -1, y: -1}
        let isAlignedOnY = false;
        for(const letter of this.placedLetters) {
            if(pos.x == -1) {
                pos.x = letter.x
                pos.y = letter.y
            }
            else {
                if(letter.x != pos.x && letter.y != pos.y) {
                    return false;
                }
                else if(letter.x == pos.x) {
                    isAlignedOnY = true;
                }
                else if(letter.y == pos.y) {
                    isAlignedOnY = false;
                }
            }
        }

        let minX = Math.min(...this.placedLetters.map(value => value.x));
        let minY = Math.min(...this.placedLetters.map(value => value.y));
        let maxX = Math.max(...this.placedLetters.map(value => value.x));
        let maxY = Math.max(...this.placedLetters.map(value => value.y));

        if(isAlignedOnY) {
            for(let i = minY; i <= maxY; i++) {
                if(this.boardService.board.grid[i][pos.x].letterObject.char == EMPTY_CHAR) {
                    return false;
                }
            }
        }
        else {
            for(let i = minX; i <= maxX; i++) {
                if(this.boardService.board.grid[pos.y][i].letterObject.char == EMPTY_CHAR) {
                    return false;
                }
            }
        }

        return true;
        
    }

}
