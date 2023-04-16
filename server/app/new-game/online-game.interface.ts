import { CardType } from '@app/game/game-logic/interface/game-state.interface';
import { GameMode } from '@app/game/game-mode.enum';

export interface OnlineGameSettingsUI {
    gameMode: GameMode;
    timePerTurn: number;
    players: string[];
    randomBonus: boolean;
    dictTitle: string;
    dictDesc?: string;
    capacity: number;
    isPrivate: boolean;
    password: boolean;
    cards?: CardType[];
}

export interface OnlineGameSettings extends OnlineGameSettingsUI {
    id: string;
    bots: string[];
}
