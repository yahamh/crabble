import { Component, EventEmitter, Output } from '@angular/core';
import { CardType } from '@app/game-logic/game/games/online-game/game-state';
import { UITextUtil } from '@app/services/ui-text-util';

@Component({
    selector: 'app-card-list',
    templateUrl: './card-list.component.html',
    styleUrls: ['./card-list.component.scss'],
})
export class CardListComponent {
    readonly cardTypes = Object.keys(CardType).filter((v) => isNaN(Number(v)));

    @Output() SelectedCardsChanged = new EventEmitter<CardType[]>();

    enabled: boolean[] = this.cardTypes.map((value) => false);
    error = false;
    errorText = UITextUtil.getText('cantPlaceOnlyJoker');

    constructor() {}

    select(card: string, index: number) {
        this.enabled[index] = !this.enabled[index];

        let selectedCards = this.cards;

        if (selectedCards.length == 1 && selectedCards[0] == CardType.Joker) {
            this.error = true;
            this.errorText = UITextUtil.getText('cantPlaceOnlyJoker');
            setTimeout(() => {
                this.error = false;
            }, 2000);
            this.disabledAll();
            selectedCards = [];
        }

        this.SelectedCardsChanged.emit(selectedCards);
    }

    disabledAll() {
        this.enabled = this.cardTypes.map((value) => false);
        return [];
    }

    enableAll() {
        this.enabled = this.cardTypes.map((value) => true);
        return this.cards;
    }

    private get cards() {
        const selectedCards: CardType[] = [];
        for (let i = 0; i < this.cardTypes.length; i++) {
            const card = this.cardTypes[i];
            if (this.enabled[i]) {
                selectedCards.push((<any>CardType)[card]);
            }
        }
        return selectedCards;
    }
}
