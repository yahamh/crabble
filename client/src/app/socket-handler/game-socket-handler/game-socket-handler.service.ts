import { Injectable } from '@angular/core';
import { CardAction, ForfeitedGameState, GameState } from '@app/game-logic/game/games/online-game/game-state';
import { TimerControls } from '@app/game-logic/game/timer/timer-controls.enum';
import { OnlineAction } from '@app/socket-handler/interfaces/online-action.interface';
import { UserAuth } from '@app/socket-handler/interfaces/user-auth.interface';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
export interface GameAuth {
    playerName: string;
    gameToken: string;
}

export interface FirstMove {
    x: number,
    y: number,
    isDestroy: boolean
}

export interface Reaction {
    emoji: string,
    user: string
}

const HAVE_NOT_JOINED_GAME_ERROR = 'You havent join a game';
const SERVER_OFFLINE_ERROR = 'The game server is offline';
const GAME_ALREADY_JOINED = 'You have already joined a game';

@Injectable({
    providedIn: 'root',
})
export class GameSocketHandlerService {
    socket: Socket;

    private forfeitGameStateSubject = new Subject<ForfeitedGameState>();
    get forfeitGameState$(): Subject<ForfeitedGameState> {
        return this.forfeitGameStateSubject;
    }

    private gameStateSubject = new Subject<GameState>();
    get gameState$(): Observable<GameState> {
        return this.gameStateSubject;
    }

    private timerControlsSubject = new Subject<TimerControls>();
    get timerControls$(): Observable<TimerControls> {
        return this.timerControlsSubject;
    }

    private disconnectedFromServerSubject = new Subject<void>();
    get disconnectedFromServer$(): Observable<void> {
        return this.disconnectedFromServerSubject;
    }

    private playerTurnsAiSubject = new Subject<string>();
    get playerTurnsAiSubject$(): Observable<string> {
        return this.playerTurnsAiSubject;
    }

    private cardActionSubject = new Subject<CardAction>();
    get cardActionSubject$(): Observable<CardAction> {
        return this.cardActionSubject;
    }

    private firstMoveSubject = new Subject<{x: number, y: number}>();
    get firstMove$(): Observable<{x: number, y: number}> {
        return this.firstMoveSubject;
    }

    private deleteMoveSubject = new Subject<void>();
    get deleteMove$(): Observable<void> {
        return this.deleteMoveSubject;
    }

    private reactionSubject = new Subject<Reaction>();
    get reaction$(): Observable<Reaction> {
        return this.reactionSubject;
    }

    joinGame(userAuth: UserAuth, observe: boolean = false) {
        if (this.socket) {
            throw Error(GAME_ALREADY_JOINED);
        }
        this.socket = this.connectToSocket();

        this.socket.on('gameState', (gameState: GameState) => {
            this.receiveGameState(gameState);
        });

        this.socket.on('cardAction', (cardAction: CardAction) => {
            this.cardActionSubject.next(cardAction);
        });

        this.socket.on('timerControl', (timerControl: TimerControls) => {
            this.receiveTimerControl(timerControl);
        });

        this.socket.on('connect_error', () => {
            this.disconnectedFromServerSubject.next();
        });

        this.socket.on('disconnected', () => {
            this.disconnectedFromServerSubject.next();
        });

        this.socket.on('transitionGameState', (lastGameState: ForfeitedGameState) => {
            this.receiveForfeitedGameState(lastGameState);
        });

        this.socket.on('playerTurnsAi', (player: string) => {
            this.playerTurnsAiSubject.next(player);
        });

        this.socket.on('reaction', (reaction: Reaction) => {
            this.reactionSubject.next(reaction);
        })

        this.socket.on("syncFirstMove", (firstMove: FirstMove) => {
            if(firstMove.isDestroy) {
                this.deleteMoveSubject.next()
            }
            else {
                this.firstMoveSubject.next({
                    x: firstMove.x,
                    y: firstMove.y
                })
            }
        })

        this.socket.emit(observe ? 'observeGame' : 'joinGame', userAuth);
    }

    playAction(action: OnlineAction) {
        if (!this.socket) {
            throw Error(HAVE_NOT_JOINED_GAME_ERROR);
        }

        if (this.socket.disconnected) {
            throw Error(SERVER_OFFLINE_ERROR);
        }
        this.socket.emit('nextAction', action);
    }

    playCard(action: CardAction) {
        this.socket.emit('cardAction', action);
    }

    firstMove(pos: {x: number, y: number}) {
        this.socket.emit('syncFirstMove', {
            isDestroy: false,
            x: pos.x,
            y: pos.y
        })
    }

    destroyFirstMove() {
        this.socket.emit('syncFirstMove', {
            isDestroy: true,
            x: 0,
            y: 0
        })
    }

    react(emoji: string, user: string) {
        this.socket.emit('reaction', {
            emoji: emoji,
            user: user
        })
    }

    disconnect() {
        if (!this.socket) {
            throw Error(HAVE_NOT_JOINED_GAME_ERROR);
        }
        this.socket.disconnect();
        this.socket = undefined as unknown as Socket;
    }

    private connectToSocket() {
        return io(environment.serverSocketUrl, { path: '/game' });
    }

    private receiveGameState(gameState: GameState) {
        this.gameStateSubject.next(gameState);
    }

    private receiveTimerControl(timerControl: TimerControls) {
        this.timerControlsSubject.next(timerControl);
    }

    private receiveForfeitedGameState(forfeitedGameState: ForfeitedGameState) {
        this.forfeitGameState$.next(forfeitedGameState);
    }
}
