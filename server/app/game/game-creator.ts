import { ConversationService } from '@app/chat/conversation.service';
import { GameCompiler } from '@app/game/game-compiler.service';
import { ServerGame } from '@app/game/game-logic/game/server-game';
import { EndOfGame } from '@app/game/game-logic/interface/end-of-game.interface';
import { CardToken, GameStateToken } from '@app/game/game-logic/interface/game-state.interface';
import { Player } from '@app/game/game-logic/player/player';
import { PointCalculatorService } from '@app/game/game-logic/point-calculator/point-calculator.service';
import { TimerController } from '@app/game/game-logic/timer/timer-controller.service';
import { LoginService } from '@app/login/login.service';
import { SystemMessagesService } from '@app/messages-service/system-messages.service';
import { OnlineGameSettings } from '@app/new-game/online-game.interface';
import { StatisticsService } from '@app/statistics/statistics.service';
import { Subject } from 'rxjs';
import { ActionCompilerService } from './game-logic/actions/action-compiler.service';
import { DictionaryService } from './game-logic/validator/dictionary/dictionary.service';
import { WordSearcher } from './game-logic/validator/word-search/word-searcher.service';
import { GameMode } from './game-mode.enum';

export class GameCreator {
    static defaultOpponentName = 'AZERTY';

    constructor(
        private pointCalculator: PointCalculatorService,
        private gameCompiler: GameCompiler,
        private messagesService: SystemMessagesService,
        private newGameStateSubject: Subject<GameStateToken>,
        private endGameSubject: Subject<EndOfGame>,
        private timerController: TimerController,
        private actionCompiler: ActionCompilerService,
        private cardSubject: Subject<CardToken>,
        private loginService: LoginService,
        private statService: StatisticsService,
        private dictionaryService: DictionaryService,
        private wordSearcher: WordSearcher,
        private conversationService: ConversationService
    ) {}

    createGame(onlineGameSettings: OnlineGameSettings, gameToken: string): ServerGame {
        const newServerGame = this.createNewGame(onlineGameSettings, gameToken);
        let players: Player[];
        players = this.createPlayers(newServerGame, onlineGameSettings.players, onlineGameSettings.bots);
        newServerGame.players = players;
        return newServerGame;
    }

    private createNewGame(gameSettings: OnlineGameSettings, gameToken: string) {
        return this.createClassicServerGame(gameSettings, gameToken);
    }

    private createClassicServerGame(gameSettings: OnlineGameSettings, gameToken: string): ServerGame {
        return new ServerGame(
            this.timerController,
            gameSettings.randomBonus,
            gameSettings.timePerTurn,
            gameToken,
            gameSettings.players.length,
            gameSettings.capacity,
            gameSettings.gameMode == GameMode.Power,
            this.actionCompiler,
            this.pointCalculator,
            this.dictionaryService,
            this.wordSearcher,
            gameSettings,
            this.gameCompiler,
            this.messagesService,
            this.newGameStateSubject,
            this.endGameSubject,
            this.cardSubject,
            this.loginService,
            this.statService,
            gameSettings.cards ?? [],
            this.conversationService
        );
    }

    private createPlayers(game: ServerGame, playerNames: string[], botNames: string[]): Player[] {
        const players: Player[] = [];
        for (const name of playerNames) {
            players.push(new Player(name, game, false));
        }
        for (const name of botNames) {
            players.push(new Player(name, game, true));
        }
        return players;
    }
}
