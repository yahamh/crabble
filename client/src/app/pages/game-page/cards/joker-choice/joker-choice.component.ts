import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CardType } from '@app/game-logic/game/games/online-game/game-state';
import { UITextUtil } from '@app/services/ui-text-util';

@Component({
    selector: 'app-joker-choice',
    templateUrl: './joker-choice.component.html',
    styleUrls: ['./joker-choice.component.scss'],
})
export class JokerChoiceComponent {
    @Input() cardsAvailable: CardType[];
    get cardTypes(): string[] {
        return this.cardsAvailable.filter((v) => v != CardType.Joker).map((value) => CardType[value]);
    }

    @Output() cardSelected = new EventEmitter<CardType>();
    @Output() closed = new EventEmitter();

    text(key: string): string {
        return UITextUtil.getText(key);
    }

    select(card: string) {
        this.cardSelected.emit((<any>CardType)[card]);
    }

    close() {
        this.closed.emit();
    }
}
