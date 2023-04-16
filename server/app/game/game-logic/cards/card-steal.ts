import { Subject } from 'rxjs';
import { CardType } from '../interface/game-state.interface';
import { Card } from './card';

export class CardSteal extends Card {
    constructor(cardActionSubject: Subject<Card>, user: string) {
        super(cardActionSubject, user);
    }

    get cardType(): CardType {
        return CardType.Steal;
    }

    onUse() {
        this.cardActionSubject.next(this);
    }
}
