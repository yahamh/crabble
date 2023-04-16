import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { BoardService } from '@app/game-logic/game/board/board.service';
import { Letter } from '@app/game-logic/game/board/letter.interface';
import { GameInfoService } from '@app/game-logic/game/game-info/game-info.service';
import { CardAction, CardType, GameState } from '@app/game-logic/game/games/online-game/game-state';
import { Player } from '@app/game-logic/player/player';
import { UITextUtil } from '@app/services/ui-text-util';
import { GameSocketHandlerService } from '@app/socket-handler/game-socket-handler/game-socket-handler.service';
import { Subject, Subscription } from 'rxjs';

@Component({
    selector: 'app-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnDestroy {
    @Input() selectedPlayer: string = this.info.players[0].name;

    @Output() transformTile = new EventEmitter<Subject<{ x: number; y: number }>>();

    error: boolean = false;
    errorText: string = this.text('notYourTurn');
    display: boolean = false;
    playCardUsed: CardAction;

    isLetterSwap = false;
    isRackSwap = false;
    isJoker = false;

    cardsAvailable: CardType[] = [];

    private cardAction$$: Subscription;
    private endTurn$$: Subscription;
    private gameState$$: Subscription;

    constructor(private info: GameInfoService, private gameSocketHandler: GameSocketHandlerService, private boardService: BoardService) {
        if (this.info.isPowerGame) {
            this.cardAction$$ = this.gameSocketHandler.cardActionSubject$.subscribe((cardAction) => {
                this.playCardUsed = cardAction;
                this.display = true;
                setTimeout(
                    () => {
                        this.display = false;
                    },
                    2500
                );
            });

            this.endTurn$$ = this.info.endTurn$.subscribe(() => {
                this.endOfTurn();
            });

            this.gameSocketHandler.gameState$.subscribe((gameState: GameState) => {
                this.cardsAvailable = gameState.cardsAvailable;
            });
        }
    }

    get user():Player {
        return this.info.isObserving ? this.info.players.find(value => value.name == this.selectedPlayer) ?? this.info.players[0] : this.info.user;
    }

    get isObserving(): boolean {
        return this.info.isObserving;
    }

    text(key: string): string {
        return UITextUtil.getText(key);
    }

    ngOnDestroy(): void {
        this.cardAction$$?.unsubscribe();
        this.endTurn$$?.unsubscribe();
        this.subscription?.unsubscribe();
        this.gameState$$?.unsubscribe();
    }

    endOfTurn(): void {
        this.closeJoker();
        this.closeLetterSwap();
        this.closeRackSwap();
        this.closeTransformTile();
    }

    get wordsBeforeCard() {
        return this.user.wordsBeforeCard;
    }

    get cards(): CardType[] {
        return this.user.cards;
    }

    get cardUsed(): string {
        return this.playCardUsed == undefined ? 'Undefined' : CardType[this.playCardUsed.card];
    }

    get cardUsedUser(): string {
        return this.playCardUsed == undefined ? 'Undefined' : this.playCardUsed.user;
    }

    convertCardTypeToString(cardType: CardType): string {
        return CardType[cardType];
    }

    attemptUseCard(card: CardType) {
        if(this.isObserving) {
            this.errorText = this.text('youAreObserver');
            this.error = true;
            setTimeout(() => {
                this.error = false;
            }, 2000);
            return;
        }

        if (this.info.user.name != this.info.activePlayer.name) {
            this.errorText = this.text('notYourTurn');
            this.error = true;
            setTimeout(() => {
                this.error = false;
            }, 2000);
            return;
        }

        if(card == CardType.SwapLetter && this.info.numberOfLettersRemaining == 0) {
            this.errorText = this.text('noMoreLetters');
            this.error = true;
            setTimeout(() => {
                this.error = false;
            }, 2000);
            return;
        }

        this.useCard(card);
    }

    private useCard(card: CardType) {
        switch (card) {
            case CardType.PassTurn:
                this.usePassTurn(card);
                break;
            case CardType.RemoveTime:
                this.useRemoveTime(card);
                break;
            case CardType.Steal:
                this.useSteal(card);
                break;
            case CardType.SwapLetter:
                this.useSwapLetter(card);
                break;
            case CardType.SwapRack:
                this.useSwapRack(card);
                break;
            case CardType.TransformTile:
                this.useTransformTile(card);
                break;
            case CardType.Points:
                this.usePoints(card);
                break;
            case CardType.Joker:
                this.useJoker(card);
                break;
        }
    }

    private usePassTurn(card: CardType) {
        this.gameSocketHandler.playCard({
            card,
            user: this.info.user.name,
        });
    }

    private useRemoveTime(card: CardType) {
        this.gameSocketHandler.playCard({
            card,
            user: this.info.user.name,
        });
    }

    private useSteal(card: CardType) {
        this.gameSocketHandler.playCard({
            card,
            user: this.info.user.name,
        });
    }

    private useSwapLetter(card: CardType) {
        this.isLetterSwap = true;
    }

    lettersChosen(value: { letterFromRack: Letter; letterToGet: Letter }) {
        this.gameSocketHandler.playCard({
            card: CardType.SwapLetter,
            user: this.info.user.name,

            letterFromRack: value.letterFromRack,
            letterToGet: value.letterToGet,
        });
        this.isLetterSwap = false;
    }

    closeLetterSwap() {
        this.isLetterSwap = false;
    }

    private useSwapRack(card: CardType) {
        this.isRackSwap = true;
    }

    playerSelected(player: string) {
        this.gameSocketHandler.playCard({
            card: CardType.SwapRack,
            user: this.info.user.name,

            playerToSwap: player,
        });
        this.isRackSwap = false;
    }

    closeRackSwap() {
        this.isRackSwap = false;
    }

    subscription: Subscription;

    private useTransformTile(card: CardType) {
        const subject = new Subject<{ x: number; y: number }>();
        this.subscription = subject.subscribe((value) => {
            this.tileSelected(value.x, value.y);
            this.subscription.unsubscribe();
        });
        this.transformTile.emit(subject);
    }

    tileSelected(x: number, y: number) {
        this.gameSocketHandler.playCard({
            card: CardType.TransformTile,
            user: this.info.user.name,

            tileToTransformX: x,
            tileToTransformY: y,
        });
    }

    closeTransformTile() {
        this.subscription?.unsubscribe();
        this.boardService.board.isSelectingTileForTransform = false;
    }

    private usePoints(card: CardType) {
        this.gameSocketHandler.playCard({
            card: CardType.Points,
            user: this.info.user.name,
        });
    }

    private useJoker(card: CardType) {
        this.isJoker = true;
    }

    jokerSelected(card: CardType) {
        this.isJoker = false;
        this.gameSocketHandler.playCard({
            card: CardType.Joker,
            user: this.info.user.name,

            cardChoice: card,
        });
    }

    closeJoker() {
        this.isJoker = false;
    }

    isSelectingTileForTransform() {
        return this.boardService.board.isSelectingTileForTransform;
    }
}
