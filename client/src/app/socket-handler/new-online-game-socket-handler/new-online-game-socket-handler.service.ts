import { Injectable } from '@angular/core';
import { isGameSettings } from '@app/game-logic/utils';
import { OnlineGameSettings, OnlineGameSettingsUI } from '@app/socket-handler/interfaces/game-settings-multi.interface';
import { BehaviorSubject, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class NewOnlineGameSocketHandler {
    pendingGameId$ = new BehaviorSubject<string>("");
    pendingGames$ = new BehaviorSubject<OnlineGameSettings[]>([]);
    observableGames$ = new BehaviorSubject<OnlineGameSettings[]>([]);
    players$ = new BehaviorSubject<string[]>([]);
    startGame$ = new BehaviorSubject<OnlineGameSettings | undefined>(undefined);
    gameObserved$ = new Subject<OnlineGameSettings>();
    isDisconnected$ = new Subject<boolean>();
    error$ = new Subject<string>();

    socket: Socket;
    host = false;
    currentGameSettings: OnlineGameSettings | undefined;

    resetGameToken() {
        this.startGame$.next(undefined);
    }

    createGameMulti(gameSettings: OnlineGameSettingsUI) {
        this.connect();
        if (!isGameSettings(gameSettings)) {
            throw Error('Games Settings are not valid. Cannot create a game.');
        }

        this.host = true;
        this.currentGameSettings = {
            bots: [],
            capacity: gameSettings.capacity,
            dictTitle: gameSettings.dictTitle,
            gameMode: gameSettings.gameMode,
            id: "",
            isPrivate: gameSettings.isPrivate,
            password: gameSettings.password,
            players: gameSettings.players,
            randomBonus: gameSettings.randomBonus,
            timePerTurn: gameSettings.timePerTurn,
            cards: gameSettings.cards,
            dictDesc: gameSettings.dictDesc
        }

        this.listenForPendingGameId();
        this.listenForPlayerJoined();
        this.listenForGameStarted();

        this.socket.emit('createGame', gameSettings);
    }

    listenForPendingGames() {
        this.connect();
        this.socket.on('pendingGames', (pendingGames: OnlineGameSettings[]) => {
            this.pendingGames$.next(pendingGames);
        });
    }

    listenForObservableGames() {
        this.connect();
        this.socket.on('observableGames', (observableGames: OnlineGameSettings[]) => {
            this.observableGames$.next(observableGames);
        });
    }

    joinPendingGame(gameSettings: OnlineGameSettings, playerName: string) {
        if (!this.socket.connected) {
            throw Error("Can't join game, not connected to server");
        }

        this.currentGameSettings = gameSettings;

        this.listenForGameStarted();
        this.listenErrorMessage();
        this.listenForPlayerJoined();
        this.listenForGameDeleted();
        this.socket.emit('joinGame', gameSettings.id, playerName);
    }

    observeGame(id: string, name: string) {
        this.socket.on('observeGame', (settings: OnlineGameSettings) => {
            this.gameObserved$.next(settings);
            this.disconnectSocket();
        });
        
        this.socket.emit('observeGame', id, name);
    }

    disconnectSocket() {
        if (!this.socket) {
            return;
        }
        this.socket.disconnect();
        this.isDisconnected$.next(true);
        this.host = false;
        this.pendingGameId$.next("");
        this.players$.next([]);
        this.startGame$.next(undefined);
        this.currentGameSettings = undefined;
    }

    startGame(id: string) {
        this.socket.emit('startGame', id);
    }

    kickPlayer(id: string, playerName: string) {
        this.socket.emit('kickPlayer', id, playerName);
    }

    private connect() {
        if(this.socket && this.socket.connected) {
            return;
        }

        this.socket = this.connectToSocket();
        this.socket.on('connect_error', () => {
            this.isDisconnected$.next(true);
        });
    }

    private listenErrorMessage() {
        this.socket.on('error', (errorContent: string) => {
            this.error$.next(errorContent);
        });
    }

    private listenForGameStarted() {
        this.socket.on('gameStarted', (gameSetting: OnlineGameSettings) => {
            this.startGame$.next(gameSetting);
            this.disconnectSocket();
        });
    }

    private listenForPendingGameId() {
        this.socket.on('pendingGameId', (pendingGameid: string) => {
            this.pendingGameId$.next(pendingGameid);
        });
    }

    private listenForPlayerJoined() {
        this.socket.on('sendPlayerList', (players: string[]) => {
            this.players$.next(players);
        });
    }

    private listenForGameDeleted() {
        this.socket.on('gameDeleted', () => {
            this.disconnectSocket();
        });
    }

    private connectToSocket() {
        return io(environment.serverSocketUrl, { path: '/newGame' });
    }
}
