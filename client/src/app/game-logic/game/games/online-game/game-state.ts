import { Letter } from '@app/game-logic/game/board/letter.interface';
import { Tile } from '@app/game-logic/game/board/tile';
import { TransitionObjective } from '@app/game-logic/game/objectives/objectives/transition-objectives';

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

export interface LightObjective {
    name: string;
    description: string;
    points: number;
    owner: string | undefined;
    progressions: PlayerProgression[];
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
    letterList: Letter[];
    isEndOfGame: boolean;
    winnerIndex: number[];
    turnTime: number;
    cardsAvailable: CardType[];
    observers: string[];
}

export interface ForfeitedGameState extends GameState {
    letterBag: Letter[];
    consecutivePass: number;
    randomBonus: boolean;
    objectives: TransitionObjective[];
}

export interface SpecialGameState extends GameState {
    publicObjectives: LightObjective[];
    privateObjectives: PrivateLightObjectives[];
}

export interface PrivateLightObjectives {
    playerName: string;
    privateObjectives: LightObjective[];
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
