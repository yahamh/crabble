import { GamePlayerStatistics } from './game-player-statistics.interface';
export interface GameStatisticsEntry {
    playerStatistics: GamePlayerStatistics[];
    winners: string[];
}
