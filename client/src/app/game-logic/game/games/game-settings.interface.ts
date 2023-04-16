import { CardType } from './online-game/game-state';

export interface GameSettings {
    timePerTurn: number;
    playerName: string;
    botDifficulty: string;
    randomBonus: boolean;
    dictTitle: string;
    dictDesc?: string;
    capacity: number;
    arePowersEnabled: boolean;
    isPrivate: boolean;
    password: string;
    cards?: CardType[];
}
