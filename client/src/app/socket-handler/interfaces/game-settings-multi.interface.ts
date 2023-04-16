import { CardType } from '@app/game-logic/game/games/online-game/game-state';
import { GameMode } from '@app/socket-handler/interfaces/game-mode.interface';

export interface OnlineGameSettingsUI {
    gameMode: GameMode;
    timePerTurn: number;
    players: string[];
    randomBonus: boolean;
    dictTitle: string;
    dictDesc?: string;
    capacity: number;
    isPrivate: boolean;
    password: string;
    cards?: CardType[];
}
export interface OnlineGameSettings extends OnlineGameSettingsUI {
    id: string;
    bots: string[];
}
