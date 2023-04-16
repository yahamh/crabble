import { Injectable } from '@angular/core';
import { CommandExecuterService } from '@app/game-logic/commands/command-executer/command-executer.service';
import { GameInfoService } from '@app/game-logic/game/game-info/game-info.service';
import { Game } from '@app/game-logic/game/games/game';
import { OnlineGameCreationParams } from '@app/game-logic/game/games/game-creator/game-creation-params';
import { GameCreatorService } from '@app/game-logic/game/games/game-creator/game-creator.service';
import { OfflineGame } from '@app/game-logic/game/games/offline-game/offline-game';
import { ForfeitedGameState } from '@app/game-logic/game/games/online-game/game-state';
import { OnlineGame } from '@app/game-logic/game/games/online-game/online-game';
import { MessagesService } from '@app/game-logic/messages/messages.service';
import { OnlineChatHandlerService } from '@app/game-logic/messages/online-chat-handler/online-chat-handler.service';
import { Player } from '@app/game-logic/player/player';
import { User } from '@app/game-logic/player/user';
import { LeaderboardService } from '@app/leaderboard/leaderboard.service';
import { GameSocketHandlerService } from '@app/socket-handler/game-socket-handler/game-socket-handler.service';
import { GameMode } from '@app/socket-handler/interfaces/game-mode.interface';
import { OnlineGameSettings } from '@app/socket-handler/interfaces/game-settings-multi.interface';
import { UserAuth } from '@app/socket-handler/interfaces/user-auth.interface';
import { Observable, Subject } from 'rxjs';
import { first } from 'rxjs/operators';
@Injectable({
    providedIn: 'root',
})
export class GameManagerService {
    private game: Game | undefined;

    private newGameSubject = new Subject<void>();
    get newGame$(): Observable<void> {
        return this.newGameSubject;
    }

    private disconnectedFromServerSubject = new Subject<void>();
    get disconnectedFromServer$(): Observable<void> {
        return this.disconnectedFromServerSubject;
    }

    get forfeitGameState$(): Observable<ForfeitedGameState> {
        return this.gameSocketHandler.forfeitGameState$;
    }

    constructor(
        private messageService: MessagesService,
        private info: GameInfoService,
        private commandExecuter: CommandExecuterService,
        private gameSocketHandler: GameSocketHandlerService,
        private onlineChat: OnlineChatHandlerService,
        private leaderboardService: LeaderboardService,
        private gameCreator: GameCreatorService,
    ) {
        this.gameSocketHandler.disconnectedFromServer$.subscribe(() => {
            this.disconnectedFromServerSubject.next();
        });
    }

    joinOnlineGame(userAuth: UserAuth, gameSettings: OnlineGameSettings) {
        if (this.game) {
            this.stopGame();
        }

        if (gameSettings.players.length <= 1) {
            throw Error('No opponent joined the game');
        }

        const username = userAuth.playerName;
        const timePerTurn = Number(gameSettings.timePerTurn);
        const gameCreationParams: OnlineGameCreationParams = {
            id: gameSettings.id,
            timePerTurn,
            username,
            arePowersEnabled: gameSettings.gameMode == GameMode.Power,
            isObserving: false
        };

        this.game = this.createOnlineGame(gameCreationParams);

        const onlineGame = this.game as OnlineGame;
        const players = this.createOnlinePlayers(username, gameSettings.players, gameSettings.bots);
        this.allocatePlayers(players);
        onlineGame.handleUserActions();
        this.info.receiveGame(this.game);
        this.onlineChat.joinChatRoomWithUser(userAuth.gameToken);
        this.gameSocketHandler.joinGame(userAuth);
    }

    observeGame(userAuth: UserAuth, gameSettings: OnlineGameSettings) {
        if (this.game) {
            this.stopGame();
        }

        if (gameSettings.players.length <= 1) {
            throw Error('No opponent joined the game');
        }

        const username = userAuth.playerName;
        const timePerTurn = Number(gameSettings.timePerTurn);
        const gameCreationParams: OnlineGameCreationParams = {
            id: gameSettings.id,
            timePerTurn,
            username,
            arePowersEnabled: gameSettings.gameMode == GameMode.Power,
            isObserving: true
        };

        this.game = this.createOnlineGame(gameCreationParams);

        const players = this.createOnlinePlayers(username, gameSettings.players, gameSettings.bots);
        this.allocatePlayers(players);
        this.info.receiveGame(this.game);
        this.gameSocketHandler.joinGame(userAuth, true);
    }

    startGame(): void {
        this.resetServices();
        if (!this.game) {
            throw Error('No game created yet');
        }
        this.game.start();
    }

    stopGame(): void {
        this.game?.stop();
        this.resetServices();
        this.game = undefined;
    }

    startConvertedGame(forfeitedGameState: ForfeitedGameState) {
        if (!this.game) {
            return;
        }
        const activePlayerIndex = forfeitedGameState.activePlayerIndex;
        this.resumeGame(activePlayerIndex);
        const gameMode = GameMode.Classic;
        this.updateLeaboardWhenGameEnds(this.game, gameMode);
    }

    private resumeGame(activePlayerIndex: number) {
        this.resetServices();
        if (!this.game) {
            throw Error('No game created yet');
        }
        (this.game as OfflineGame).resume(activePlayerIndex);
    }

    private updateLeaboardWhenGameEnds(game: Game, gameMode: GameMode) {
        game.isEndOfGame$.pipe(first()).subscribe(() => {
            if (!this.game) {
                return;
            }
            this.updateLeaderboard(this.game.players, gameMode);
        });
    }

    private resetServices() {
        this.messageService.clearLog();
        this.commandExecuter.resetDebug();
    }

    private updateLeaderboard(players: Player[], mode: GameMode) {
        if (!players) {
            return;
        }
        players.forEach((player) => {
            if (player instanceof User) {
                const score = { mode, name: player.name, point: player.points };
                this.leaderboardService.updateLeaderboard(mode, score);
            }
        });
    }

    private createOnlinePlayers(userName: string, playerNames: string[], botNames: string[]): Player[] {
        if(!playerNames.find(value => value == userName)) {
            this.info.receiveUserObserver(userName);
        }

        const players = playerNames.map((value) => {
            const user = new User(value, false);
            if (value == userName) {
                this.info.receiveUser(user);
            }
            return user;
        });

        for (const botName of botNames) {
            players.push(new User(botName, true));
        }

        return players;
    }

    private allocatePlayers(players: Player[]) {
        if (!this.game) {
            return;
        }
        this.game.players = players;
    }

    private createOnlineGame(gameCreationParams: OnlineGameCreationParams) {
        return this.gameCreator.createOnlineGame(gameCreationParams);
    }
}
