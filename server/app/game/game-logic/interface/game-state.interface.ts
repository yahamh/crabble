import { Letter } from '@app/game/game-logic/board/letter.interface';
import { Tile } from '@app/game/game-logic/board/tile';

export enum CardType {
    PassTurn,
    TransformTile,
    RemoveTime,
    SwapLetter,
    SwapRack,
    Steal,
    Points,
    Joker,
}

export interface LightPlayer {
    name: string;
    points: number;
    letterRack: Letter[];
    wordsBeforeCard?: number;
    cards?: CardType[];
}

export interface PlayerProgression {
    playerName: string;
    progression: number;
}

export interface GameState {
    players: LightPlayer[];
    activePlayerIndex: number;
    grid: Tile[][];
    lettersRemaining: number;
    isEndOfGame: boolean;
    winnerIndex: number[];
    turnTime: number;
    letterList: Letter[];
    cardsAvailable: CardType[];
    observers: string[];
}

export interface ForfeitedGameState extends GameState {
    letterBag: Letter[];
    consecutivePass: number;
    randomBonus: boolean;
}

export interface GameStateToken {
    gameState: GameState | ForfeitedGameState;
    gameToken: string;
}

export interface CardToken {
    cardAction: CardAction;
    gameToken: string;
}

export interface CardAction {
    card: CardType;
    user: string;

    letterFromRack?: Letter;
    letterToGet?: Letter;

    playerToSwap?: string;

    tileToTransformX?: number;
    tileToTransformY?: number;
    letterMultiplicator?: number;
    wordMultiplicator?: number;

    cardChoice?: CardType;

    bestPlayers?: string[];
    pointsForEach?: number;

    bonusPoints?: number;

    turnPassedOf?: string;
}
