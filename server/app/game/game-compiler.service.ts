import { Tile } from '@app/game/game-logic/board/tile';
import { ServerGame } from '@app/game/game-logic/game/server-game';
import { ForfeitedGameState, GameState, LightPlayer } from '@app/game/game-logic/interface/game-state.interface';
import { Player } from '@app/game/game-logic/player/player';
import { Service } from 'typedi';

@Service()
export class GameCompiler {
    compile(game: ServerGame): GameState {
        const gameState = this.compileGameState(game);
        return gameState;
    }

    compileForfeited(game: ServerGame): ForfeitedGameState {
        const gameState = this.compile(game);
        const lastGameState = gameState as ForfeitedGameState;
        lastGameState.consecutivePass = game.consecutivePass;
        lastGameState.letterBag = game.letterBag.gameLetters;
        lastGameState.randomBonus = game.randomBonus;
        return lastGameState;
    }

    private compileGameState(game: ServerGame): GameState {
        const lightPlayers: LightPlayer[] = this.fillPlayer(game.players);
        const activePlayer = game.activePlayerIndex;
        const lightGrid: Tile[][] = game.board.grid;
        let lightEndOfGame = false;
        let lightWinnerIndex: number[] = [];
        if (game.isEndOfGame()) {
            lightEndOfGame = true;
            const winners = game.getWinner();
            lightWinnerIndex = [];
            for (const winner of winners) {
                lightWinnerIndex.push(game.players.findIndex((value) => value.name === winner.name));
            }
        } else {
            lightEndOfGame = false;
        }
        return {
            players: lightPlayers,
            activePlayerIndex: activePlayer,
            grid: lightGrid,
            isEndOfGame: lightEndOfGame,
            lettersRemaining: game.letterBag.lettersLeft,
            winnerIndex: lightWinnerIndex,
            turnTime: game.calculatedTimePerTurn,
            letterList: game.letterBag.letterBag,
            cardsAvailable: game.cardsAvailable,
            observers: game.observers
        };
    }

    private fillPlayer(players: Player[]): LightPlayer[] {
        return players.map((player) => {
            return {
                name: player.name,
                points: player.points,
                letterRack: player.letterRack,
                cards: player.cards,
                wordsBeforeCard: player.wordsBeforeCard,
            };
        });
    }
}
