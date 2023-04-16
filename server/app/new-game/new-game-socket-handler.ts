import { isGameSettings } from '@app/game/game-logic/utils';
import { DictionaryService } from '@app/game/game-logic/validator/dictionary/dictionary.service';
import { NewGameManagerService } from '@app/new-game/new-game-manager.service';
import { OnlineGameSettings, OnlineGameSettingsUI } from '@app/new-game/online-game.interface';
import * as http from 'http';
import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

const pendingGames = 'pendingGames';
const createGame = 'createGame';
const joinGame = 'joinGame';
const gameStarted = 'gameStarted';
const pendingGameId = 'pendingGameId';
const sendPlayerList = 'sendPlayerList';
const gameDeleted = 'gameDeleted';

export class NewGameSocketHandler {
    readonly ioServer: Server;
    private socketAndName: Map<string, Socket> = new Map<string, Socket>();

    constructor(server: http.Server, private newGameManagerService: NewGameManagerService, private dictionaryService: DictionaryService) {
        this.ioServer = new Server(server, {
            path: '/newGame',
            cors: { origin: '*', methods: ['GET', 'POST'] },
        });

        this.newGameManagerService.updateObservableGames$.subscribe(() => {
            this.emitObservableGamesToAll();
        })
    }

    newGameHandler(): void {
        this.ioServer.on('connection', (socket) => {
            let gameId: string;
            let isHost = false;
            let user: string;

            socket.emit(pendingGames, this.newGameManagerService.getPendingGames());
            socket.emit('observableGames', this.newGameManagerService.getObservableGames());

            socket.on(createGame, (gameSettings: OnlineGameSettingsUI) => {
                try {
                    isHost = true;
                    user = gameSettings.players[0];
                    this.socketAndName.set(user, socket);
                    console.log(`create ${gameSettings.gameMode}`);
                    gameId = this.createGame(gameSettings, socket);
                    this.dictionaryService.makeGameDictionary(gameId, gameSettings.dictTitle);
                    this.sendPlayerListToAll(gameId, gameSettings.players);
                    this.emitPendingGamesToAll();
                    this.emitObservableGamesToAll();
                } catch (e) {
                    this.sendError(e, socket);
                }
            });

            socket.on(joinGame, (id: string, name: string) => {
                try {
                    gameId = id;
                    user = name;
                    this.socketAndName.set(name, socket);
                    this.joinGame(id, name, this.getPendingGame(id), socket);
                    this.emitPendingGamesToAll();
                    this.emitObservableGamesToAll();
                } catch (e) {
                    this.sendError(e, socket);
                }
            });

            socket.on('observeGame', (id: string, name: string) => {
                this.observeGame(id, name, socket);
            });

            socket.on('startGame', (id: string) => {
                this.onStartGame(id);
            });

            socket.on('disconnect', () => {
                this.socketAndName.delete(user);
                this.onDisconnect(gameId, isHost, user);
                this.emitPendingGamesToAll();
                this.emitObservableGamesToAll();
            });

            socket.on('kickPlayer', (id: string, playerName: string) => {
                const target = this.socketAndName.get(playerName);
                if (target) {
                    target.emit(gameDeleted);
                }
            });
        });
    }

    private createGame(gameSettings: OnlineGameSettingsUI, socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>): string {
        if (!isGameSettings(gameSettings)) {
            throw Error('Impossible de rejoindre la partie, les paramètres de partie sont invalides.');
        }
        const gameId = this.newGameManagerService.createPendingGame(gameSettings);
        socket.emit(pendingGameId, gameId);
        socket.join(gameId);
        return gameId;
    }

    private joinGame(
        id: string,
        name: string,
        gameSettings: OnlineGameSettings,
        socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>,
    ) {
        if (typeof id !== 'string' || typeof name !== 'string') {
            throw Error('Impossible de rejoindre la partie, les paramètres sont invalides.');
        }
        const players = this.newGameManagerService.joinPendingGame(id, name);
        if (!players) {
            throw Error("Impossible de rejoindre la partie, elle n'existe pas.");
        }
        socket.join(id);
        this.sendPlayerListToAll(id, players);
        // this.sendGameSettingsToPlayers(id, gameToken, gameSettings);
    }

    private getPendingGame(id: string): OnlineGameSettings {
        return this.newGameManagerService.getPendingGame(id);
    }

    private onDisconnect(gameId: string, isHost: boolean, user: string) {
        if (!gameId) {
            return;
        }

        if (isHost) {
            this.newGameManagerService.deletePendingGame(gameId);
            this.ioServer.to(gameId).emit(gameDeleted);
        } else {
            try {
                this.getPendingGame(gameId).players = this.getPendingGame(gameId).players.filter((value) => value != user);
                this.sendPlayerListToAll(gameId, this.getPendingGame(gameId).players);
            } catch {
                console.log(`${gameId} is deleted.`);
            }
        }
    }

    private sendError(error: Error, socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>) {
        const errorMessage = error.message;
        socket.emit('error', errorMessage);
    }

    private onStartGame(gameId: string) {
        if (typeof gameId !== 'string') {
            throw Error('Impossible de rejoindre la partie, les paramètres sont invalides.');
        }

        const gameSettings = this.getPendingGame(gameId);
        gameSettings.bots = [];

        for (let i = 0; i < gameSettings.capacity - gameSettings.players.length; i++) {
            gameSettings.bots.push(this.generateBotName(gameSettings.bots.concat(gameSettings.players)));
        }

        this.ioServer.to(gameId).emit(gameStarted, gameSettings);

        this.newGameManagerService.startGame(gameId);
    }

    private generateBotName(bannedNames: string[]): string {
        const possibleBotNames = [
            'Apple',
            'Strawberries',
            'Pineapple',
            'Grape',
            'Mango',
            'Banana',
            'Orange',
            'Pomegranate',
            'Watermelon',
            'Lemon',
            'Kiwi',
            'Cherry',
            'Mangosteen',
            'Dragonfruit',
            'Avocado',
            'Papaya',
        ];

        let botName = possibleBotNames[Math.floor(possibleBotNames.length * Math.random())];

        while (bannedNames.find((value) => value == botName)) {
            botName = possibleBotNames[Math.floor(possibleBotNames.length * Math.random())];
        }

        return botName;
    }

    private sendPlayerListToAll(gameId: string, players: string[]) {
        this.ioServer.to(gameId).emit(sendPlayerList, players);
    }

    private emitPendingGamesToAll() {
        this.ioServer.emit(pendingGames, this.newGameManagerService.getPendingGames());
    }

    private emitObservableGamesToAll() {
        this.ioServer.emit('observableGames', this.newGameManagerService.getObservableGames())
    }

    private observeGame(id: string, name: string, socket: Socket) {
        this.newGameManagerService.observeGame(id, name, socket.id);
        socket.emit('observeGame', this.newGameManagerService.getObservableGames().find(value => value.id == id));
    }
}
