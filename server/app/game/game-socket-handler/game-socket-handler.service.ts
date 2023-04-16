import { CardAction, CardToken, ForfeitedGameState, GameState, GameStateToken } from '@app/game/game-logic/interface/game-state.interface';
import { TimerControls } from '@app/game/game-logic/timer/timer-controls.enum';
import { TimerGameControl } from '@app/game/game-logic/timer/timer-game-control.interface';
import { GameManagerService } from '@app/game/game-manager/game-manager.services';
import { OnlineAction } from '@app/game/online-action.interface';
import * as http from 'http';
import * as io from 'socket.io';
import { UserAuth } from './user-auth.interface';

export interface FirstMove {
    x: number,
    y: number,
    isDestroy: boolean
}

export interface Reaction {
    emoji: string,
    user: string
}

export class GameSocketsHandler {
    readonly sio: io.Server;
    constructor(server: http.Server, private gameManager: GameManagerService) {
        this.sio = new io.Server(server, {
            path: '/game',
            cors: { origin: '*', methods: ['GET', 'POST'] },
            pingTimeout: 5000,
        });
        this.gameManager.newGameState$.subscribe((gameStateToken: GameStateToken) => {
            const gameToken = gameStateToken.gameToken;
            const gameState = gameStateToken.gameState;
            this.emitGameState(gameState, gameToken);
        });

        this.gameManager.timerControl$.subscribe((timerGameControl: TimerGameControl) => {
            const gameToken = timerGameControl.gameToken;
            const timerControl = timerGameControl.control;
            this.emitTimerControl(timerControl, gameToken);
        });

        this.gameManager.forfeitedGameState$.subscribe((forfeitedGameState: GameStateToken) => {
            const gameToken = forfeitedGameState.gameToken;
            const gameState = forfeitedGameState.gameState;
            if ('letterBag' in gameState) {
                this.emitTransitionGameState(gameState, gameToken);
            }
        });

        this.gameManager.deleteGame$.subscribe((gameToken: string) => {
            this.sio.to(gameToken).disconnectSockets()
        })

        this.gameManager.card$.subscribe((card: CardToken) => {
            this.emitCardAction(card.cardAction, card.gameToken);
        });
    }

    handleSockets() {
        this.sio.on('connection', (socket) => {
            let gameToken: string;
            let observer: boolean = false;
            let name: string;

            socket.on('observeGame', (userAuth: UserAuth) => {
                try {
                    name = userAuth.playerName;
                    observer = true;
                    gameToken = userAuth.gameToken;
                    socket.join(userAuth.gameToken);
                    this.emitGameStateTo(socket, userAuth.gameToken);
                } catch (e) {
                    socket.disconnect();
                }
            })

            socket.on('joinGame', (userAuth: UserAuth) => {
                try {
                    name = userAuth.playerName;
                    gameToken = userAuth.gameToken;
                    observer = false;
                    socket.join(gameToken);
                    this.addPlayerToGame(socket.id, userAuth);
                } catch (e) {
                    socket.disconnect();
                }
            });

            socket.on('nextAction', (action: OnlineAction) => {
                try {
                    this.sendPlayerAction(socket.id, action);
                    this.emitFirstMove(gameToken, {
                        isDestroy: true,
                        x: 0,
                        y: 0
                    })
                } catch (e) {
                    socket.disconnect();
                }
            });

            socket.on('cardAction', (action: CardAction) => {
                this.sendCardAction(gameToken, action);
            });

            socket.on('reaction', (reaction: Reaction) => {
                this.sio.to(gameToken).emit('reaction', reaction);
            });

            socket.on('disconnect', () => {
                if (observer) {
                    this.removeObserver(name, gameToken);
                }
                else {
                    this.removePlayer(socket.id, gameToken);
                }
            });

            socket.on('syncFirstMove', (firstMove: FirstMove) => {
                this.emitFirstMove(gameToken, firstMove);
            })
        });
    }

    private emitFirstMove(gameToken: string, firstMove: FirstMove) {
        this.sio.to(gameToken).emit("syncFirstMove", firstMove);
    }

    private emitTimerControl(timerControl: TimerControls, gameToken: string) {
        this.sio.to(gameToken).emit('timerControl', timerControl);
    }

    private emitGameState(gameState: GameState, gameToken: string) {
        this.sio.to(gameToken).emit('gameState', gameState);
    }

    private emitTransitionGameState(gameState: ForfeitedGameState, gameToken: string) {
        this.sio.to(gameToken).emit('transitionGameState', gameState);
    }

    private emitCardAction(cardAction: CardAction, gameToken: string) {
        this.sio.to(gameToken).emit('cardAction', cardAction);
    }

    private addPlayerToGame(socketId: string, userAuth: UserAuth) {
        const playerId = socketId;
        this.gameManager.addPlayerToGame(playerId, userAuth);
    }

    private sendPlayerAction(socketId: string, action: OnlineAction) {
        const playerId = socketId;
        this.gameManager.receivePlayerAction(playerId, action);
    }

    private sendCardAction(gameId: string, action: CardAction) {
        this.gameManager.receiveCardAction(gameId, action);
    }

    private emitGameStateTo(socket: io.Socket, gameId: string) {
        this.gameManager.emitGameStateTo(socket, gameId);
    }

    private removePlayer(playerId: string, gameToken: string) {
        const name = this.gameManager.removePlayerFromGame(playerId);
        if (name) {
            this.sio.to(gameToken).emit('playerTurnsAi', name);
        }
    }

    private removeObserver(playerId: string, gameToken: string) {
        this.gameManager.removeObserverFromGame(playerId, gameToken);
    }
}
