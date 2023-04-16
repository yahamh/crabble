export interface GameCreationParams {
    timePerTurn: number;
    arePowersEnabled: boolean;
    isObserving: boolean;
}

export interface OfflineGameCreationParams extends GameCreationParams {
    randomBonus: boolean;
}

export interface OnlineGameCreationParams extends GameCreationParams {
    id: string;
    username: string;
}
