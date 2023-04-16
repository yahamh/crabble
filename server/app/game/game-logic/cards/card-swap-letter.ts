import { Subject } from 'rxjs';
import { Letter } from '../board/letter.interface';
import { CardType } from '../interface/game-state.interface';
import { Card } from './card';

export class CardSwapLetter extends Card {
    constructor(cardActionSubject: Subject<Card>, user: string, public letterFromRack: Letter, public letterToGet: Letter) {
        super(cardActionSubject, user);
    }

    get cardType(): CardType {
        return CardType.SwapLetter;
    }

    onUse() {
        this.cardActionSubject.next(this);
    }
}
