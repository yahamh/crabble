import { ConversationService } from '@app/chat/conversation.service';
import { NEW_GAME_TIMEOUT } from '@app/constants';
import { LeaderboardService } from '@app/database/leaderboard-service/leaderboard.service';
import { GameCompiler } from '@app/game/game-compiler.service';
import { GameCreator } from '@app/game/game-creator';
import { ActionCompilerService } from '@app/game/game-logic/actions/action-compiler.service';
import { ServerGame } from '@app/game/game-logic/game/server-game';
import { EndOfGame, EndOfGameReason } from '@app/game/game-logic/interface/end-of-game.interface';
import { CardAction, CardToken, GameStateToken } from '@app/game/game-logic/interface/game-state.interface';
import { Player } from '@app/game/game-logic/player/player';
import { PointCalculatorService } from '@app/game/game-logic/point-calculator/point-calculator.service';
import { TimerController } from '@app/game/game-logic/timer/timer-controller.service';
import { TimerGameControl } from '@app/game/game-logic/timer/timer-game-control.interface';
import { DictionaryService } from '@app/game/game-logic/validator/dictionary/dictionary.service';
import { BindedSocket } from '@app/game/game-manager/binded-client.interface';
import { GameMode } from '@app/game/game-mode.enum';
import { UserAuth } from '@app/game/game-socket-handler/user-auth.interface';
import { OnlineAction } from '@app/game/online-action.interface';
import { LoginService } from '@app/login/login.service';
import { SystemMessagesService } from '@app/messages-service/system-messages.service';
import { OnlineGameSettings } from '@app/new-game/online-game.interface';
import { StatisticsService } from '@app/statistics/statistics.service';
import { Observable, Subject } from 'rxjs';
import { Socket } from 'socket.io';
import { Service } from 'typedi';
import { WordSearcher } from '../game-logic/validator/word-search/word-searcher.service';

export interface PlayerRef {
    gameToken: string;
    player: Player;
}

@Service()
export class GameManagerService {
    activeGames = new Map<string, ServerGame>();
    activePlayers = new Map<string, PlayerRef>(); // gameToken => PlayerRef[]
    linkedClients = new Map<string, BindedSocket[]>(); // gameToken => BindedSocket[]

    endGame$ = new Subject<EndOfGame>(); // gameToken

    private gameCreator: GameCreator;
    private newGameStateSubject = new Subject<GameStateToken>();
    private forfeitedGameStateSubject = new Subject<GameStateToken>();
    private deleteGameSubject = new Subject<string>();
    private cardSubject = new Subject<CardToken>();

    get forfeitedGameState$(): Observable<GameStateToken> {
        return this.forfeitedGameStateSubject;
    }

    get newGameState$(): Observable<GameStateToken> {
        return this.newGameStateSubject;
    }

    get timerControl$(): Observable<TimerGameControl> {
        return this.timerController.timerControl$;
    }

    get card$(): Observable<CardToken> {
        return this.cardSubject;
    }

    get deleteGame$(): Observable<string> {
        return this.deleteGameSubject;
    }

    constructor(
        private pointCalculator: PointCalculatorService,
        private messagesService: SystemMessagesService,
        private actionCompiler: ActionCompilerService,
        private gameCompiler: GameCompiler,
        private timerController: TimerController,
        private leaderboardService: LeaderboardService,
        private dictionaryService: DictionaryService,
        private loginService: LoginService,
        private statService: StatisticsService,
        private wordSearcher: WordSearcher,
        private conversationService: ConversationService
    ) {
        this.gameCreator = new GameCreator(
            this.pointCalculator,
            this.gameCompiler,
            this.messagesService,
            this.newGameStateSubject,
            this.endGame$,
            this.timerController,
            this.actionCompiler,
            this.cardSubject,
            this.loginService,
            this.statService,
            this.dictionaryService,
            this.wordSearcher,
            this.conversationService
        );

        this.endGame$.subscribe((endOfGame: EndOfGame) => {
            const gameToken = endOfGame.gameToken;
            if (endOfGame.reason === EndOfGameReason.GameEnded) {
                this.updateLeaderboard(endOfGame.players, gameToken);
            }
            this.deleteGame(gameToken);
        });
    }

    createGame(gameToken: string, onlineGameSettings: OnlineGameSettings) {
        const newServerGame = this.gameCreator.createGame(onlineGameSettings, gameToken);
        this.activeGames.set(gameToken, newServerGame);
        this.linkedClients.set(gameToken, []);
        this.startInactiveGameDestructionTimer(gameToken, newServerGame);
    }

    addPlayerToGame(playerId: string, userAuth: UserAuth) {
        const gameToken = userAuth.gameToken;
        const game = this.activeGames.get(gameToken);
        if (!game) {
            throw Error(`GameToken ${gameToken} is not in active game`);
        }

        const playerName = userAuth.playerName;
        const user = game.players.find((player: Player) => player.name === playerName);
        if (!user) {
            throw Error(`Player ${playerName} not created in ${gameToken}`);
        }

        const linkedClientsInGame = this.linkedClients.get(gameToken);
        if (!linkedClientsInGame) {
            throw Error(`Can't add player, GameToken ${gameToken} is not in active game`);
        }
        const clientFound = linkedClientsInGame.find((client: BindedSocket) => client.name === playerName);
        if (clientFound) {
            throw Error(`Can't add player, someone else is already linked to ${gameToken} with ${playerName}`);
        }

        const playerRef = { gameToken, player: user };
        this.activePlayers.set(playerId, playerRef);
        const bindedSocket: BindedSocket = { socketID: playerId, name: playerName };
        linkedClientsInGame.push(bindedSocket);
        if (linkedClientsInGame.length === game.humanPlayers) {
            game.start();
        }
    }

    receivePlayerAction(playerId: string, action: OnlineAction) {
        const playerRef = this.activePlayers.get(playerId);
        if (!playerRef) {
            throw Error(`Player ${playerId} is not active anymore`);
        }
        const player = playerRef.player;
        console.log(player.name)
        try {
            const compiledAction = this.actionCompiler.translate(action, player);
            player.play(compiledAction);
        } catch (e) {
            console.log(e)
            return;
        }
    }

    receiveCardAction(gameId: string, action: CardAction) {
        const gameRef = this.activeGames.get(gameId);
        if (!gameRef) {
            throw Error(`Game ${gameId} does not exist.`);
        }
        gameRef.useCard(action);
    }

    emitGameStateTo(socket: Socket, gameId: string) {
        socket.emit('gameState', this.activeGames.get(gameId)?.getLastGameState());
    }

    removePlayerFromGame(playerId: string): string | undefined {
        const playerRef = this.activePlayers.get(playerId);
        if (!playerRef) {
            return;
        }
        const gameToken = playerRef.gameToken;
        const game = this.activeGames.get(gameToken);
        this.activePlayers.delete(playerId);
        this.linkedClients.set(gameToken, this.linkedClients.get(gameToken)?.filter(v => v.socketID != playerId) ?? [])
        if (!game) {
            return;
        }
        game.replacePlayer(playerRef.player.name);
        // this.sendForfeitedGameState(game);
        // this.endForfeitedGame(game, playerRef.player.name);
        // this.deleteGame(gameToken);
        return playerRef.player.name;
    }

    removeObserverFromGame(playerName: string, gameId: string) {
        this.activeGames.get(gameId)?.removeObserver(playerName);
        if(this.linkedClients.get(gameId)) {
            this.linkedClients.set(gameId, this.linkedClients.get(gameId)?.filter(value => value.name != playerName) ?? []);
        }
    }

    observeGame(id: string, name: string, socketId: string) {
        this.activeGames.get(id)?.addObserver(name);
        this.linkedClients.get(id)?.push({
            name: name,
            socketID: socketId
        });
    }

    private startInactiveGameDestructionTimer(gameToken: string, game: ServerGame) {
        setTimeout(() => {
            this.checkIfNeedsDeletion(gameToken, game);
        }, NEW_GAME_TIMEOUT);
    }

    private checkIfNeedsDeletion(gameToken: string, game: ServerGame) {
        const currentLinkedClient = this.linkedClients.get(gameToken);
        if (!currentLinkedClient) {
            this.deleteInactiveGame(gameToken);
            return;
        }

        if (currentLinkedClient.length - game.observers.length != game.humanPlayers || game.humanPlayers == 0) {
            this.deleteInactiveGame(gameToken);
            return;
        }

        setTimeout(() => {
            this.checkIfNeedsDeletion(gameToken, game);
        }, NEW_GAME_TIMEOUT);
    }

    private endGame(game: ServerGame) {
        game.stop();
    }
    /*
    private endForfeitedGame(game: ServerGame, playerName: string) {
        game.forfeit(playerName);
    }

    private sendForfeitedGameState(game: ServerGame) {
        if (game.activePlayerIndex === undefined) {
            return;
        }
        const gameToken = game.gameToken;
        const gameState = this.gameCompiler.compileForfeited(game);
        const lastGameToken: GameStateToken = { gameState, gameToken };
        this.forfeitedGameStateSubject.next(lastGameToken);
    }
*/
    private deleteInactiveGame(gameToken: string) {
        const serverGame = this.activeGames.get(gameToken);
        this.endGame$.next({
            gameToken: gameToken,
            players: [],
            reason: EndOfGameReason.Other
        });
        if (serverGame) {
            this.endGame(serverGame);
        }
        this.deleteGame(gameToken);
    }

    private deleteGame(gameToken: string) {
        this.deleteGameSubject.next(gameToken);
        this.activeGames.delete(gameToken);
        this.linkedClients.delete(gameToken);
        this.dictionaryService.deleteGameDictionary(gameToken);
    }

    private updateLeaderboard(players: Player[], gameToken: string) {
        const gameMode = GameMode.Classic;
        players.forEach((player) => {
            const score = { name: player.name, point: player.points };
            this.leaderboardService.updateLeaderboard(score, gameMode);
        });
    }
}
