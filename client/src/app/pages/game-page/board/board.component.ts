import { AfterViewInit, Component, DoCheck, ElementRef, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { UIInputControllerService } from '@app/game-logic/actions/ui-actions/ui-input-controller.service';
import { UIPlace } from '@app/game-logic/actions/ui-actions/ui-place';
import { ASCII_CODE, EMPTY_CHAR, JOKER_CHAR, NOT_FOUND } from '@app/game-logic/constants';
import { Board } from '@app/game-logic/game/board/board';
import { BoardService } from '@app/game-logic/game/board/board.service';
import { Letter } from '@app/game-logic/game/board/letter.interface';
import { GameInfoService } from '@app/game-logic/game/game-info/game-info.service';
import { InputComponent, InputType, UIInput } from '@app/game-logic/interfaces/ui-input';
import { CanvasDrawer } from '@app/pages/game-page/board/canvas-drawer';
import { DragAndDropService } from '@app/services/drag-and-drop.service';
import { GameSocketHandlerService } from '@app/socket-handler/game-socket-handler/game-socket-handler.service';

const MAX_FONT_SIZE = 22;
const MIN_FONT_SIZE = 14;

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements AfterViewInit, DoCheck {
    @ViewChild('ScrabbleBoard') scrabbleBoard: ElementRef;
    @Output() clickTile = new EventEmitter();
    @ViewChild('gridCanvas') private canvas!: ElementRef<HTMLCanvasElement>;
    readonly self = InputComponent.Board;
    board: Board;
    minFontSize = MIN_FONT_SIZE;
    maxFontSize = MAX_FONT_SIZE;
    fontSize: number;
    canvasDrawer: CanvasDrawer;
    canvasContext: CanvasRenderingContext2D;
    canvasElement: HTMLElement | null;
    choosingJoker = false;

    constructor(
        private boardService: BoardService, 
        private inputController: UIInputControllerService, 
        private dragAndDropService: DragAndDropService, 
        private info: GameInfoService,
        private gameSocketService: GameSocketHandlerService
    ) {
        this.board = this.boardService.board;
        this.board.gridChanged$.subscribe(() => {
            this.canvasDrawer.drawGrid(this.board, this.fontSize);
        });
        this.fontSize = (this.minFontSize + this.maxFontSize) / 2;

        this.gameSocketService.firstMove$.subscribe(firstMove => {
            if(this.info.activePlayer != this.info.user) {
                this.board.setFirstMove(firstMove.x, firstMove.y);
            }
        })

        this.gameSocketService.deleteMove$.subscribe(() => {
            if(this.info.activePlayer != this.info.user) {
                this.board.resetFirstMove()
            }
        })
    }

    @HostListener('window:resize', ['$event'])
    onResize() {
        this.setupCanvasDrawer();
    }

    isSelectingTileForTransform() {
        return this.boardService.board.isSelectingTileForTransform;
    }

    ngAfterViewInit() {
        (this.scrabbleBoard.nativeElement as HTMLParagraphElement).style.fontSize = `${this.fontSize}px`;
        this.canvasContext = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.canvasElement = document.getElementById('canvas');
        if (this.canvasElement) {
            this.setupCanvasDrawer();
        }
        this.canvasDrawer.drawGrid(this.board, this.fontSize);
    }

    ngDoCheck() {
        if (!this.canvasDrawer) {
            return;
        }
        if (this.inputController.activeAction instanceof UIPlace) {
            if (this.inputController.activeAction.pointerPosition) {
                this.canvasDrawer.setIndicator(
                    this.inputController.activeAction.pointerPosition.x,
                    this.inputController.activeAction.pointerPosition.y,
                );
                this.canvasDrawer.setDirection(this.inputController.activeAction.direction);
            }
        } else {
            this.canvasDrawer.setIndicator(NOT_FOUND, NOT_FOUND);
        }
        this.canvasDrawer.drawGrid(this.board, this.fontSize);
    }

    getFont(): string {
        return `font-size: ${this.fontSize}px;`;
    }

    convertASCIIToChar(code: number): string {
        return String.fromCharCode(ASCII_CODE + code);
    }

    updateSetting(event: MatSliderChange) {
        if (event.value != null) {
            this.fontSize = event.value;
            (this.scrabbleBoard.nativeElement as HTMLParagraphElement).style.fontSize = `${this.fontSize}px`;
        }
    }

    canvasClick(event: MouseEvent): void {
        if(!this.dragAndDropService.movingLetter && this.dragAndDropService.placedLetters.length == 0 && this.info.activePlayer == this.info.user && !this.choosingJoker) {
            const pos = this.canvasDrawer.coordToTilePosition(event.offsetX, event.offsetY);
            if(!(this.inputController.activeAction instanceof UIPlace) || this.inputController.activeAction instanceof UIPlace && this.inputController.activeAction.concernedIndexes.size == 0) {
                this.gameSocketService.firstMove({x: pos.indexI, y: pos.indexJ})
            }

            const input: UIInput = { from: this.self, type: InputType.LeftClick, args: { x: pos.indexI, y: pos.indexJ } };
            this.clickTile.emit(input);
        }
    }

    wasFirst = false;
    @HostListener('document:mousedown', ['$event'])
    onMouseDown(event: MouseEvent) {
        if(this.choosingJoker) {
            return;
        }

        const boundingRect = this.canvasElement?.getBoundingClientRect();
        if(boundingRect) {
            const pos = this.canvasDrawer.coordToTilePosition(event.x - boundingRect.left, event.y - boundingRect.top)
            const x = pos.indexI;
            const y = pos.indexJ;
            if(x >= 0 && x < 15 && y >= 0 && y < 15) {
                const letter = this.dragAndDropService.placedLetters.find(value => value.x == x && value.y == y);
                const letterIndex = this.dragAndDropService.placedLetters.findIndex(value => value.x == x && value.y == y);
                if(letter) {
                    this.dragAndDropService.placedLetters = this.dragAndDropService.placedLetters.filter(value => value != letter);

                    if(this.dragAndDropService.placedLetters.length == 0) {
                        this.gameSocketService.destroyFirstMove()
                    }

                    this.wasFirst = letterIndex == 0;

                    this.dragAndDropService.movingLetter = {index: letter.index, letter: {
                        char: letter.letter.char,
                        value: letter.letter.value,
                        isTemp: true
                    }}
                    this.board.resetTile(x, y)
                }
            }
            else {
                this.wasFirst = false;
            }
        }
    }

    tempLetter: {letter: Letter, index: number, x: number, y: number}
    @HostListener('document:mouseup', ['$event'])
    onMouseUp(event: MouseEvent) {
        if(this.dragAndDropService.movingLetter && !this.choosingJoker) {
            const boundingRect = this.canvasElement?.getBoundingClientRect();
            if(boundingRect) {
                const pos = this.canvasDrawer.coordToTilePosition(event.x - boundingRect.left, event.y - boundingRect.top)
                const x = pos.indexI;
                const y = pos.indexJ;
                if(x >= 0 && x < 15 && y >= 0 && y < 15) {
                    if((this.dragAndDropService.placedLetters.length == 0 || this.wasFirst) && this.dragAndDropService.movingLetter) {
                        this.gameSocketService.firstMove({x, y})
                    }

                    if(this.dragAndDropService.movingLetter.letter.char == JOKER_CHAR) {
                        this.choosingJoker = true;
                        this.tempLetter = {
                            index: this.dragAndDropService.movingLetter.index,
                            letter: {
                                char: this.dragAndDropService.movingLetter.letter.char,
                                value: this.dragAndDropService.movingLetter.letter.value,
                                isJoker: true
                            },
                            x: x,
                            y: y
                        }
                    }
                    else if(this.board.grid[y][x].letterObject.char == EMPTY_CHAR) {
                        this.board.setTile(this.dragAndDropService.movingLetter.letter, x, y)
                        if(this.wasFirst) {
                            this.dragAndDropService.placedLetters.unshift({
                                index: this.dragAndDropService.movingLetter.index,
                                letter: {
                                    char: this.dragAndDropService.movingLetter.letter.char,
                                    value: this.dragAndDropService.movingLetter.letter.value,
                                    isJoker: this.dragAndDropService.movingLetter.letter.value == 0
                                },
                                x: x,
                                y: y
                            });
                        }
                        else {
                            this.dragAndDropService.placedLetters.push({
                                index: this.dragAndDropService.movingLetter.index,
                                letter: {
                                    char: this.dragAndDropService.movingLetter.letter.char,
                                    value: this.dragAndDropService.movingLetter.letter.value,
                                    isJoker: this.dragAndDropService.movingLetter.letter.value == 0
                                },
                                x: x,
                                y: y
                            });
                        }
                    }

                    this.wasFirst = false;
                }
                this.dragAndDropService.movingLetter = undefined
            }
        }
    }

    letterChosen(letter: Letter) {
        this.choosingJoker = false;
        this.board.setTile(letter, this.tempLetter.x, this.tempLetter.y)
        this.dragAndDropService.placedLetters.push({
            index: this.tempLetter.index,
            letter: {
                char: letter.char,
                value: letter.value,
                isJoker: true
            },
            x: this.tempLetter.x,
            y: this.tempLetter.y
        })
        this.dragAndDropService.movingLetter = undefined
    }

    private setupCanvasDrawer() {
        if (this.canvasElement) {
            this.canvasElement.setAttribute('width', this.canvasElement.clientWidth.toString());
            this.canvasElement.setAttribute('height', this.canvasElement.clientWidth.toString());
            this.canvasDrawer = new CanvasDrawer(this.canvasContext, this.canvasElement.clientWidth, this.canvasElement.clientHeight);
        }
    }
}
