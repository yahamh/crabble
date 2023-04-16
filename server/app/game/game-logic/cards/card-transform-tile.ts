import { Subject } from 'rxjs';
import { CardType } from '../interface/game-state.interface';
import { Card } from './card';

export class CardTransformTile extends Card {
    constructor(cardActionSubject: Subject<Card>, user: string, public x: number, public y: number) {
        super(cardActionSubject, user);
    }

    get cardType(): CardType {
        return CardType.TransformTile;
    }

    onUse() {
        this.cardActionSubject.next(this);
    }
}
