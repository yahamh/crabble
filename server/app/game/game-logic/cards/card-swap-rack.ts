import { Subject } from 'rxjs';
import { CardType } from '../interface/game-state.interface';
import { Card } from './card';

export class CardSwapRack extends Card {
    constructor(cardActionSubject: Subject<Card>, user: string, public playerToSwap: string) {
        super(cardActionSubject, user);
    }

    get cardType(): CardType {
        return CardType.SwapRack;
    }

    onUse() {
        this.cardActionSubject.next(this);
    }
}
