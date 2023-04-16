import { Subject } from 'rxjs';
import { CardType } from '../interface/game-state.interface';
import { Card } from './card';

export class CardJoker extends Card {
    constructor(cardActionSubject: Subject<Card>, user: string, public choice: CardType) {
        super(cardActionSubject, user);
    }

    get cardType(): CardType {
        return CardType.Joker;
    }

    onUse() {
        this.cardActionSubject.next(this);
    }
}
