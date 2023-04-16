import { Injectable } from '@angular/core';
import { OnlineActionCompilerService } from '@app/game-logic/actions/online-actions/online-action-compiler.service';
import { BoardService } from '@app/game-logic/game/board/board.service';
import { OnlineGameCreationParams } from '@app/game-logic/game/games/game-creator/game-creation-params';
import { OnlineGame } from '@app/game-logic/game/games/online-game/online-game';
import { TimerService } from '@app/game-logic/game/timer/timer.service';
import { GameSocketHandlerService } from '@app/socket-handler/game-socket-handler/game-socket-handler.service';

@Injectable({
    providedIn: 'root',
})
export class GameCreatorService {
    constructor(
        private timer: TimerService,
        private boardService: BoardService,
        private gameSocketHandler: GameSocketHandlerService,
        private onlineActionCompiler: OnlineActionCompilerService,
    ) {}

    createOnlineGame(gameCreationParams: OnlineGameCreationParams): OnlineGame {
        return new OnlineGame(
            gameCreationParams.id,
            gameCreationParams.timePerTurn,
            gameCreationParams.arePowersEnabled,
            gameCreationParams.username,
            gameCreationParams.isObserving,
            this.timer,
            this.gameSocketHandler,
            this.boardService,
            this.onlineActionCompiler,
        );
    }
}
