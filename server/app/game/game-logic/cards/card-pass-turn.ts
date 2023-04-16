import { Subject } from 'rxjs';
import { CardType } from '../interface/game-state.interface';
import { Card } from './card';

export class CardPassTurn extends Card {
    constructor(cardActionSubject: Subject<Card>, user: string) {
        super(cardActionSubject, user);
    }

    get cardType(): CardType {
        return CardType.PassTurn;
    }

    onUse() {
        this.cardActionSubject.next(this);
    }
}
