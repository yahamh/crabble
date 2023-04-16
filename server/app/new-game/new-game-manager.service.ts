import { DictionaryService } from '@app/game/game-logic/validator/dictionary/dictionary.service';
import { GameManagerService } from '@app/game/game-manager/game-manager.services';
import { OnlineGameSettings, OnlineGameSettingsUI } from '@app/new-game/online-game.interface';
import { Observable, Subject } from 'rxjs';
import { Service } from 'typedi';

@Service()
export class NewGameManagerService {
    static gameIdCounter: number = 0;
    pendingGames: Map<string, OnlineGameSettingsUI> = new Map<string, OnlineGameSettingsUI>();

    private updateObservableGamesSubject = new Subject<undefined>();
    public get updateObservableGames$(): Observable<undefined> {
        return this.updateObservableGamesSubject;
    }

    constructor(private gameMaster: GameManagerService, private dictionaryService: DictionaryService) {
        this.gameMaster.endGame$.subscribe(reason => {
            this.updateObservableGamesSubject.next(undefined);
        })
    }

    getObservableGames(): OnlineGameSettings[] {
        return Array.from(this.gameMaster.activeGames.values()).filter(game => !game.isGameEnded).map(value => value.baseGameSettings).filter(value => !value.isPrivate);
    }

    observeGame(id: string, name: string, socketId: string) {
        this.gameMaster.observeGame(id, name, socketId);
    }

    getPendingGames(): OnlineGameSettings[] {
        const games: OnlineGameSettings[] = [];
        this.pendingGames.forEach((game, id) => {
            if (game.players.length < game.capacity) {
                games.push(this.toOnlineGameSettings(id, game));
            }
        });
        return games;
    }

    createPendingGame(gameSetting: OnlineGameSettingsUI): string {
        const gameId = this.generateId();
        this.pendingGames.set(gameId, gameSetting);
        return gameId;
    }

    joinPendingGame(id: string, name: string): string[] | undefined {
        if (!this.isPendingGame(id)) {
            return;
        }
        const gameSettings = this.pendingGames.get(id);
        if (!gameSettings) {
            return;
        }
        if (gameSettings.players.length == gameSettings.capacity) {
            return;
        }
        gameSettings.players.push(name);
        return gameSettings.players;
    }

    deletePendingGame(id: string) {
        const gameStarted = this.gameMaster.activeGames.has(id);
        if (!gameStarted) {
            this.dictionaryService.deleteGameDictionary(id);
        }
        this.pendingGames.delete(id);
    }

    getPendingGame(id: string): OnlineGameSettings {
        if (!this.pendingGames.get(id)) {
            throw Error('This game does not exist.');
        }
        const onlineGameSetting = this.toOnlineGameSettings(id, this.pendingGames.get(id));
        return onlineGameSetting;
    }

    private isPendingGame(id: string): boolean {
        return this.pendingGames.has(id);
    }

    startGame(gameToken: string) {
        const gameSettings = this.getPendingGame(gameToken);
        this.gameMaster.createGame(gameToken, gameSettings);
        this.deletePendingGame(gameSettings.id);
    }

    private generateId(): string {
        const gameId = NewGameManagerService.gameIdCounter.toString();
        NewGameManagerService.gameIdCounter = (NewGameManagerService.gameIdCounter + 1) % Number.MAX_SAFE_INTEGER;
        return gameId;
    }

    private toOnlineGameSettings(id: string, settings: OnlineGameSettingsUI | undefined): OnlineGameSettings {
        const gameSettings = settings as OnlineGameSettings;
        gameSettings.id = id;
        return gameSettings;
    }
}
