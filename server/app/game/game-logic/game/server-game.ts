import { ConversationService } from '@app/chat/conversation.service';
import { GameCompiler } from '@app/game/game-compiler.service';
import { Action } from '@app/game/game-logic/actions/action';
import { PassTurn } from '@app/game/game-logic/actions/pass-turn';
import { Board } from '@app/game/game-logic/board/board';
import { LetterBag } from '@app/game/game-logic/board/letter-bag';
import { BONUS_POINTS, MAX_CONSECUTIVE_PASS } from '@app/game/game-logic/constants';
import { EndOfGame, EndOfGameReason } from '@app/game/game-logic/interface/end-of-game.interface';
import { CardAction, CardToken, CardType, GameState, GameStateToken } from '@app/game/game-logic/interface/game-state.interface';
import { Player } from '@app/game/game-logic/player/player';
import { PointCalculatorService } from '@app/game/game-logic/point-calculator/point-calculator.service';
import { TimerController } from '@app/game/game-logic/timer/timer-controller.service';
import { Timer } from '@app/game/game-logic/timer/timer.service';
import { GamePlayerStatistics } from '@app/interfaces/game-player-statistics.interface';
import { GameStatisticsEntry } from '@app/interfaces/game-statistics-entry.interface';
import { LoginService } from '@app/login/login.service';
import { SystemMessagesService } from '@app/messages-service/system-messages.service';
import { OnlineGameSettings } from '@app/new-game/online-game.interface';
import { StatisticsService } from '@app/statistics/statistics.service';
import { first, mapTo, merge, Observable, Subject } from 'rxjs';
import { ActionCompilerService } from '../actions/action-compiler.service';
import { Letter } from '../board/letter.interface';
import { Card } from '../cards/card';
import { CardJoker } from '../cards/card-joker';
import { CardManager } from '../cards/card-manager';
import { CardSwapLetter } from '../cards/card-swap-letter';
import { CardSwapRack } from '../cards/card-swap-rack';
import { CardTransformTile } from '../cards/card-transform-tile';
import { DictionaryService } from '../validator/dictionary/dictionary.service';
import { WordSearcher } from '../validator/word-search/word-searcher.service';

export class ServerGame {
    static readonly maxConsecutivePass = MAX_CONSECUTIVE_PASS;
    letterBag: LetterBag = new LetterBag();
    players: Player[] = [];
    activePlayerIndex: number;
    consecutivePass: number = 0;
    board: Board;
    timer: Timer;
    winnerByForfeitedIndex: number;

    lastGameState: GameState;
    observers: string[] = [];

    calculatedTimePerTurn: number;

    isGameEnded = false;

    isEnded$ = new Subject<undefined>();
    endReason: EndOfGameReason;

    get numberOfLettersRemaining(): number {
        return this.letterBag.lettersLeft;
    }

    private cardActionSubject = new Subject<Card>();
    get cardAction$(): Observable<Card> {
        return this.cardActionSubject;
    }

    get cardsAvailable(): CardType[] {
        return this.cardManager.cardsAvailable;
    }

    private cardManager: CardManager;

    constructor(
        timerController: TimerController,
        public randomBonus: boolean,
        public timePerTurn: number,
        public gameToken: string,
        public humanPlayers: number,
        public capacity: number,
        public arePowersEnabled: boolean,
        public actionCompiler: ActionCompilerService,
        public pointCalculator: PointCalculatorService,
        public dictionaryService: DictionaryService,
        public wordSearcher: WordSearcher,
        public baseGameSettings: OnlineGameSettings,
        private gameCompiler: GameCompiler,
        protected messagesService: SystemMessagesService,
        private newGameStateSubject: Subject<GameStateToken>,
        private endGameSubject: Subject<EndOfGame>,
        private cardSubject: Subject<CardToken>,
        private loginService: LoginService,
        private statService: StatisticsService,
        cardsAvailable: CardType[],
        private conversationService: ConversationService
    ) {
        this.cardManager = new CardManager(this.cardActionSubject, cardsAvailable);

        this.timer = new Timer(gameToken, timerController);
        this.board = new Board(randomBonus);

        this.calculatedTimePerTurn = this.timePerTurn;

        this.cardAction$.subscribe((card: Card) => {
            const playerRef = this.players.find((players) => players.name == card.user);
            if (!playerRef) {
                return;
            }
            playerRef.cards.splice(
                playerRef.cards.findIndex((value) => value == card.cardType),
                1,
            );

            const cardAction: CardAction = {
                card: card.cardType,
                user: card.user,

                cardChoice: card instanceof CardJoker ? card.choice : undefined,

                letterFromRack: card instanceof CardSwapLetter ? card.letterFromRack : undefined,
                letterToGet: card instanceof CardSwapLetter ? card.letterToGet : undefined,

                playerToSwap: card instanceof CardSwapRack ? card.playerToSwap : undefined,

                tileToTransformX: card instanceof CardTransformTile ? card.x : undefined,
                tileToTransformY: card instanceof CardTransformTile ? card.y : undefined,
            };

            switch (card.cardType) {
                case CardType.Steal:
                    const steal = this.stealPointsToWinner(playerRef);
                    cardAction.bestPlayers = steal.players;
                    cardAction.pointsForEach = steal.pointsForEach;
                    break;
                case CardType.SwapLetter:
                    const swapLetterCard = card as CardSwapLetter;
                    this.swapLetters(playerRef, swapLetterCard.letterFromRack, swapLetterCard.letterToGet);
                    break;
                case CardType.SwapRack:
                    const swapRackCard = card as CardSwapRack;
                    this.swapRack(playerRef, swapRackCard.playerToSwap);
                    break;
                case CardType.TransformTile:
                    const transformTileCard = card as CardTransformTile;
                    const multiplicator = this.transformTile(transformTileCard.x, transformTileCard.y);
                    cardAction.letterMultiplicator = multiplicator.letterMultiplicator != 0 ? multiplicator.letterMultiplicator : undefined;
                    cardAction.wordMultiplicator = multiplicator.wordMultiplicator != 0 ? multiplicator.wordMultiplicator : undefined;
                    break;
                case CardType.Points:
                    const bonusPoints = this.giveBonusPoints(playerRef);
                    cardAction.bonusPoints = bonusPoints;
                    break;
                case CardType.Joker:
                    const jokerCard = card as CardJoker;
                    this.giveJokerCard(playerRef, jokerCard.choice);
                    break;
                case CardType.PassTurn:
                    cardAction.turnPassedOf = this.players[(this.activePlayerIndex + 1) % this.players.length].name;
                    break;
            }

            this.cardSubject.next({
                cardAction,
                gameToken: this.gameToken,
            });

            this.emitGameState();
        });

        this.conversationService
    }

    start(): void {
        if (this.players.length < 2) {
            throw Error('Game started with less than 2 players');
        }
        if (this.players.length != this.capacity) {
            throw Error('Game started with the wrong number of players.');
        }

        this.drawGameLetters();
        this.pickFirstPlayer();
        this.emitGameState();
        this.startTurn();
    }

    stop() {
        console.log('stop');
        this.isGameEnded = true;
        this.endReason = EndOfGameReason.Other;
        this.isEnded$.next(undefined);
    }

    forfeit(playerName: string) {
        this.winnerByForfeitedIndex = this.players.findIndex((player) => {
            return player.name !== playerName;
        });
        this.endReason = EndOfGameReason.Forfeit;
        this.isEnded$.next(undefined);
    }

    isEndOfGame() {
        if (this.letterBag.isEmpty) {
            for (const player of this.players) {
                if (player.isLetterRackEmpty) {
                    return true;
                }
            }
        }
        if (this.consecutivePass >= ServerGame.maxConsecutivePass) {
            return true;
        }
        return false;
    }

    getActivePlayer() {
        return this.players[this.activePlayerIndex];
    }

    doAction(action: Action) {
        if (action instanceof PassTurn) {
            this.consecutivePass += 1;
        } else {
            this.consecutivePass = 0;
        }
    }

    getWinner(): Player[] {
        let highestScore = Number.MIN_SAFE_INTEGER;
        let winners: Player[] = [];
        if (this.winnerByForfeitedIndex !== undefined) {
            const winner = this.players[this.winnerByForfeitedIndex];
            winners = [winner];
            return winners;
        }

        for (const player of this.players) {
            if (player.points === highestScore) {
                winners.push(player);
            }
            if (player.points > highestScore) {
                highestScore = player.points;
                winners = [player];
            }
        }
        return winners;
    }

    replacePlayer(name: string) {
        const player = this.players.find((player) => player.name == name);
        if (player && !player.isVirtual) {
            player.isVirtual = true;

            this.humanPlayers--;

            if (this.players.every((value) => value.isVirtual)) {
                this.stop();
                return;
            }

            if (this.getActivePlayer() == player) {
                player.executeAutomatedAction();
            }
        }
    }

    getLastGameState(): GameState {
        return this.lastGameState;
    }

    useCard(cardAction: CardAction) {
        this.cardManager.useCard(cardAction);
    }

    removeObserver(name: string) {
        this.observers = this.observers.filter((value) => value != name);
        this.emitGameState();
    }

    addObserver(name: string) {
        this.observers.push(name);
        this.emitGameState();
    }

    private async onEndOfGame(reason: EndOfGameReason) {
        this.pointCalculator.endOfGamePointDeduction(this);
        this.displayLettersLeft();
        this.emitGameState();
        await this.addGameStats();
        if (reason === EndOfGameReason.GameEnded) {
            this.endGameSubject.next({ gameToken: this.gameToken, reason, players: this.players });
        }
    }

    private async addGameStats(): Promise<void> {
        const gameStat: GameStatisticsEntry = {
            winners: await this.getWinnerIds(),
            playerStatistics: await this.getPlayerStatistics(),
        };
        await this.statService.addGameStatistics(gameStat);
    }

    private async getWinnerIds(): Promise<string[]> {
        const winnerIds: string[] = [];
        const winners = this.getWinner();
        for (const winner of winners) {
            if(winner.isVirtual) {
                continue;
            }

            const id = await this.loginService.getIdByUsername(winner.name);
            if (id != '') {
                winnerIds.push(id);
            }
        }
        return winnerIds;
    }

    private async getPlayerStatistics(): Promise<GamePlayerStatistics[]> {
        const statistics: GamePlayerStatistics[] = [];
        for (const player of this.players) {
            if(player.isVirtual) {
                continue;
            }

            const playerId = await this.loginService.getIdByUsername(player.name);
            if (playerId != '') {
                statistics.push({
                    playerId: playerId,
                    score: player.points.toString(),
                    timeSec: player.cumulativeGameTime.toString(),
                });
            }
        }
        return statistics;
    }

    private nextPlayer() {
        this.activePlayerIndex = (this.activePlayerIndex + (this.cardManager.shouldPassTurn() ? 2 : 1)) % this.players.length;
    }

    private pickFirstPlayer() {
        const max = this.players.length;
        const firstPlayer = Math.floor(Math.random() * max);
        this.activePlayerIndex = firstPlayer;
    }

    private stealPointsToWinner(user: Player): { players: string[]; pointsForEach: number } {
        const bestScore = Math.max(...this.players.map((value) => value.points));
        const bestPlayers = this.players.filter((value) => value.points == bestScore);
        for (const player of bestPlayers) {
            player.points = 0;
        }

        const points = Math.floor((bestScore * bestPlayers.length) / this.players.length);

        for (const player of this.players) {
            player.points += points;
        }

        user.points += (bestScore * bestPlayers.length) % this.players.length;

        return { players: bestPlayers.map((value) => value.name), pointsForEach: points };
    }

    private swapLetters(user: Player, letterFromRack: Letter, letterToGet: Letter) {
        const letterToRemoveFromRack = user.letterRack.find((value) => value.char == letterFromRack.char);
        const letterToRemoveFromBag = this.letterBag.letterBag.find((value) => value.char == letterToGet.char);

        if (!letterToRemoveFromBag || !letterToRemoveFromRack) {
            return;
        }

        user.letterRack = user.letterRack.filter((value) => value != letterToRemoveFromRack);
        this.letterBag.gameLetters = this.letterBag.gameLetters.filter((value) => value != letterToRemoveFromBag);

        user.letterRack.push(letterToRemoveFromBag);
        this.letterBag.addLetter(letterToRemoveFromRack);
    }

    private swapRack(user: Player, playerToSwap: string) {
        const playerToSwapRef = this.players.find((value) => value.name == playerToSwap);

        if (!playerToSwapRef) {
            return;
        }

        const tempRack = playerToSwapRef.letterRack;
        playerToSwapRef.letterRack = user.letterRack;
        user.letterRack = tempRack;
    }

    private transformTile(x: number, y: number): { letterMultiplicator: number; wordMultiplicator: number } {
        return this.board.addRandomMultiplicator(x, y);
    }

    private giveBonusPoints(user: Player): number {
        user.points += BONUS_POINTS;
        return BONUS_POINTS;
    }

    private giveJokerCard(user: Player, card: CardType) {
        user.addCard(card);
    }

    private drawGameLetters() {
        for (const player of this.players) {
            player.letterRack = this.letterBag.drawEmptyRackLetters();
        }
    }

    private async startTurn() {
        if (this.isGameEnded) {
            return;
        }

        if (this.endReason) {
            await this.onEndOfGame(this.endReason);
            return;
        }
        const activePlayer = this.players[this.activePlayerIndex];

        const timerEnd$ = this.timer.start(this.calculatedTimePerTurn).pipe(mapTo(new PassTurn(activePlayer)));
        const turnEnds$ = merge(activePlayer.action$, timerEnd$, this.isEnded$);
        turnEnds$.pipe(first()).subscribe((action) => {
            if (!this.isGameEnded) {
                this.endOfTurn(action);
            }
        });

        if (activePlayer.isVirtual) {
            console.log(`${activePlayer.name} performed ${activePlayer.executeAutomatedAction()}`);
        }
    }

    private async endOfTurn(action: Action | undefined) {
        this.timer.stop();

        this.players[this.activePlayerIndex].cumulativeGameTime += this.timer.currentTime / 1000;

        if (!action) {
            await this.onEndOfGame(EndOfGameReason.Forfeit);
            return;
        }

        if (this.endReason) {
            await this.onEndOfGame(this.endReason);
            return;
        }

        action.end$.subscribe(async () => {
            if (this.isEndOfGame()) {
                await this.onEndOfGame(EndOfGameReason.GameEnded);
                return;
            }
            this.nextPlayer();

            this.calculatedTimePerTurn =
                this.timePerTurn / Math.pow(2, this.cardManager.dividerRemoveTime(this.players[this.activePlayerIndex].name));

            this.emitGameState();
            this.startTurn();
        });

        action.execute(this);
    }

    private emitGameState() {
        const gameState = this.gameCompiler.compile(this);
        const gameStateToken: GameStateToken = { gameState, gameToken: this.gameToken };
        this.lastGameState = gameState;
        this.newGameStateSubject.next(gameStateToken);
    }

    private displayLettersLeft() {
        let message = 'Fin de partie - lettres restantes';
        this.messagesService.sendGlobal(this.gameToken, message);
        for (const player of this.players) {
            message = `${player.name}: ${player.printLetterRack()}`;
            this.messagesService.sendGlobal(this.gameToken, message);
        }
    }
}
