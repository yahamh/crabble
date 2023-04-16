import { Subject } from 'rxjs';
import { CardType } from '../interface/game-state.interface';

export abstract class Card {
    constructor(protected cardActionSubject: Subject<Card>, public user: string) {}

    public abstract get cardType(): CardType;
    public abstract onUse(): void;
}
