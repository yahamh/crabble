import { DatabaseService } from '@app/database/database.service';
import { ConnectionStatisticsEntry } from '@app/interfaces/connection-statistics-entry.interface';
import { ConnectionStatisticsResponse } from '@app/interfaces/connection-statistics-response.interface';
import { GameStatisticsEntry } from '@app/interfaces/game-statistics-entry.interface';
import { GameStatisticsResponse } from '@app/interfaces/game-statistics-response.interface';
import { Collection } from 'mongodb';
import { Service } from 'typedi';
import { CONNECTION_STATISTICS_COLLECTION, GAME_STATISTICS_COLLECTION } from './statistics-constants';

@Service()
export class StatisticsService {
    constructor(private databaseService: DatabaseService) {}

    async getConnectionStatistics(userId: string): Promise<ConnectionStatisticsResponse | undefined> {
        try {
            const collection = this.getConnectionStatsCollection();
            const connectionStats = await collection.find({ playerId: userId }).toArray();
            return { entries: connectionStats };
        } catch (e) {
            return undefined;
        }
    }

    async getGameStatistics(userId: string): Promise<GameStatisticsResponse | undefined> {
        try {
            const games = await this.getFilteredGamesByUser(userId);
            const wins = await this.filterGamesByWin(userId);
            const stats: GameStatisticsResponse = {
                totalNumberOfGames: games.length.toString(),
                totalNumberOfWins: wins.length.toString(),
                averageScorePerGame: this.calculateAverageScorePerGame(userId, games).toString(),
                averageTimePerGameSeconds: this.calculateAverageTimePerGame(userId, games).toString(),
            };

            console.log(stats);
            return stats;
        } catch (e) {
            return undefined;
        }
    }

    async addGameStatistics(gameStat: GameStatisticsEntry): Promise<boolean> {
        try {
            const collection = this.getGameStatsCollection();
            await collection.insertOne(gameStat);
            return true;
        } catch (e) {
            return false;
        }
    }

    async addConnectionStatistics(connectionStat: ConnectionStatisticsEntry): Promise<boolean> {
        try {
            const collection = this.getConnectionStatsCollection();
            await collection.insertOne(connectionStat);
            return true;
        } catch (e) {
            return false;
        }
    }

    private calculateAverageScorePerGame(userId: string, games: GameStatisticsEntry[]): number {
        let sumOfScores = 0;
        games.forEach((game: GameStatisticsEntry) => {
            try {
                const match = game.playerStatistics.filter((playerStat) => {
                    if (playerStat.playerId == '') return false; //In case a CPU gets in there, with no valid ID.
                    return (playerStat.playerId as any).equals(userId);
                });
                sumOfScores += Number.parseInt(match[0].score, 10);
            } catch (e) {
                console.log('no match??', e);
            }
        });
        return games.length == 0 ? 0 : sumOfScores / games.length;
    }

    private calculateAverageTimePerGame(userId: string, games: GameStatisticsEntry[]): number {
        let sumOfTime = 0;
        games.forEach((game: GameStatisticsEntry) => {
            try {
                const match = game.playerStatistics.filter((playerStat) => {
                    if (playerStat.playerId == '') return false; //In case a CPU gets in there, with no valid ID.
                    return (playerStat.playerId as any).equals(userId);
                });
                sumOfTime += Number.parseInt(match[0].timeSec, 10);
            } catch (e) {
                console.log('no match??', e);
            }
        });
        return games.length == 0 ? 0 : sumOfTime / games.length;
    }

    private async getFilteredGamesByUser(userId: string): Promise<GameStatisticsEntry[]> {
        const collection = this.getGameStatsCollection();
        const games = await collection.find({ playerStatistics: { $elemMatch: { playerId: userId } } }).toArray();
        return games;
    }

    private async filterGamesByWin(userId: string): Promise<GameStatisticsEntry[]> {
        const collection = this.getGameStatsCollection();
        const games = await collection.find({ winners: userId }).toArray();
        return games;
    }
    private getGameStatsCollection(): Collection<GameStatisticsEntry> {
        return this.databaseService.database.collection(GAME_STATISTICS_COLLECTION);
    }

    private getConnectionStatsCollection(): Collection<ConnectionStatisticsEntry> {
        return this.databaseService.database.collection(CONNECTION_STATISTICS_COLLECTION);
    }
}
