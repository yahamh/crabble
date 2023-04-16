import { ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AbandonDialogComponent } from '@app/components/modals/abandon-dialog/abandon-dialog.component';
import { DisconnectedFromServerComponent } from '@app/components/modals/disconnected-from-server/disconnected-from-server.component';
import { ErrorDialogComponent } from '@app/components/modals/error-dialog/error-dialog.component';
import { WinnerDialogComponent, WinnerDialogData } from '@app/components/modals/winner-dialog/winner-dialog.component';
import { UIInputControllerService } from '@app/game-logic/actions/ui-actions/ui-input-controller.service';
import { UIPlace } from '@app/game-logic/actions/ui-actions/ui-place';
import { RACK_LETTER_COUNT } from '@app/game-logic/constants';
import { BoardService } from '@app/game-logic/game/board/board.service';
import { GameInfoService } from '@app/game-logic/game/game-info/game-info.service';
import { GameManagerService } from '@app/game-logic/game/games/game-manager/game-manager.service';
import { InputComponent, InputType, UIInput } from '@app/game-logic/interfaces/ui-input';
import { DragAndDropService } from '@app/services/drag-and-drop.service';
import { ElectronService } from '@app/services/electron.service';
import { UITextUtil } from '@app/services/ui-text-util';
import { Subject, Subscription } from 'rxjs';
import { CardComponent } from './cards/card/card.component';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnDestroy {
    @ViewChild('card', { static: false }) cardElement: ElementRef<CardComponent>;

    isChatDocked = true;

    dialogRef: MatDialogRef<DisconnectedFromServerComponent> | undefined;
    private disconnected$$: Subscription;
    private forfeited$$: Subscription;
    private endOfGame$$: Subscription;

    isExchanging = false;
    selectedPlayer = "";

    constructor(
        private gameManager: GameManagerService,
        private info: GameInfoService,
        private router: Router,
        private dialog: MatDialog,
        private inputController: UIInputControllerService,
        private boardService: BoardService,
        private dragAndDropService: DragAndDropService, 
        private electron: ElectronService, 
        private changeDetectorRef: ChangeDetectorRef
    ) {
        this.isChatDocked = this.electron.isChatDocked;
        this.electron.chatVisibilityChanged$.subscribe(value => {
            this.isChatDocked = value;
            this.changeDetectorRef.detectChanges();
        })

        try {
            this.gameManager.startGame();
        } catch (e) {
            this.router.navigate(['/']);
        }

        this.disconnected$$ = this.gameManager.disconnectedFromServer$.subscribe(() => {
            this.openDisconnected();
        });

        this.forfeited$$ = this.gameManager.forfeitGameState$.subscribe((forfeitedGameState) => {
            const data = this.text('yourOpponentForfeitted');
            const forfeitedDialogRef = this.dialog.open(ErrorDialogComponent, { disableClose: true, autoFocus: true, data });
            forfeitedDialogRef.afterClosed().subscribe(() => {
                this.gameManager.startConvertedGame(forfeitedGameState);
            });
        });

        this.endOfGame$$ = this.info.isEndOfGame$.subscribe(() => {
            const winnerNames = this.info.winner.map((player) => player.name);
            const userName = this.info.user.name;
            const isWinner = winnerNames.includes(userName);
            const data: WinnerDialogData = { winnerNames, isWinner };
            this.dialog.open(WinnerDialogComponent, { disableClose: true, autoFocus: true, data });
        });
    }

    text(key: string): string {
        return UITextUtil.getText(key);
    }

    selectPlayer(player: string) {
        this.selectedPlayer = player;
    }

    @HostListener('window:keyup', ['$event'])
    keypressEvent($event: KeyboardEvent) {
        const input: UIInput = { type: InputType.KeyPress, args: $event.key };
        this.inputController.receive(input);
    }

    isSelectingTileForTransform() {
        return this.boardService.board.isSelectingTileForTransform;
    }

    ngOnDestroy() {
        this.disconnected$$.unsubscribe();
        this.forfeited$$.unsubscribe();
        this.endOfGame$$.unsubscribe();
    }

    receiveInput(input: UIInput) {
        if (input.from == InputComponent.Board && this.boardService.board.isSelectingTileForTransform) {
            const pos = input.args as { x: number; y: number };
            if (!this.boardService.board.isMultiplicatorOrLetterHere(pos.x, pos.y)) {
                this.subject?.next(pos);
                this.subject = undefined;
                this.boardService.board.isSelectingTileForTransform = false;
            }
        } else {
            this.inputController.receive(input);
        }
    }

    abandon() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        this.dialog.open(AbandonDialogComponent, dialogConfig);
    }

    quit() {
        this.gameManager.stopGame();
        this.router.navigate(['/home']);
    }

    get isObserving(): boolean {
        return this.info.isObserving;
    }

    get isItMyTurn(): boolean {
        try {
            if (this.isEndOfGame) {
                return false;
            }
            return this.info.user === this.info.activePlayer;
        } catch (e) {
            return false;
        }
    }

    get isEndOfGame(): boolean {
        return this.info.isEndOfGame;
    }

    get canPlace(): boolean {
        return (
            this.isItMyTurn &&
            ((this.inputController.activeAction instanceof UIPlace && this.inputController.canBeExecuted) ||
                (!(this.inputController.activeAction instanceof UIPlace) && this.dragAndDropService.isPlacementRight()))
        );
    }

    get canExchange(): boolean {
        return this.isItMyTurn && this.info.numberOfLettersRemaining > RACK_LETTER_COUNT;
    }

    get canPass(): boolean {
        return this.isItMyTurn;
    }

    get canCancel(): boolean {
        return this.inputController.activeAction instanceof UIPlace || this.dragAndDropService.placedLetters.length != 0 || this.canExchange;
    }

    get isPowerGame(): boolean {
        return this.info.isPowerGame;
    }

    pass() {
        this.inputController.pass(this.info.user);
    }

    confirm() {
        this.inputController.confirm();
    }

    exchange() {
        this.isExchanging = true;
    }

    closeExchange() {
        this.isExchanging = false;
    }

    exchanging(indexes: number[]) {
        this.inputController.exchange(indexes);
        this.isExchanging = false;
    }

    cancel() {
        this.inputController.cancel();
    }

    openDisconnected() {
        if (this.dialogRef) {
            return;
        }
        this.gameManager.stopGame();
        const disconnectedDialogConfig = new MatDialogConfig();
        disconnectedDialogConfig.autoFocus = true;
        disconnectedDialogConfig.disableClose = true;
        disconnectedDialogConfig.minWidth = 550;
        this.dialogRef = this.dialog.open(DisconnectedFromServerComponent, disconnectedDialogConfig);
        this.dialogRef.afterClosed().subscribe(() => {
            this.dialogRef = undefined;
            this.router.navigate(['/']);
        });
    }

    subject: Subject<{ x: number; y: number }> | undefined;

    transformTile(value: Subject<{ x: number; y: number }>) {
        this.subject = value;
        this.boardService.board.isSelectingTileForTransform = true;
    }
}
