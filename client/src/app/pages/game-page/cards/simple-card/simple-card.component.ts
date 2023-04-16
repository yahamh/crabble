import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { CardUtil } from '@app/game-logic/cards/card-utils';
import { CardAction, CardType } from '@app/game-logic/game/games/online-game/game-state';
import { UITextUtil } from '@app/services/ui-text-util';

@Component({
    selector: 'app-simple-card',
    templateUrl: './simple-card.component.html',
    styleUrls: ['./simple-card.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class SimpleCardComponent {
    @Output() cardClicked = new EventEmitter();

    @Input() card: string;
    @Input() clickable: boolean;
    @Input() cardAction: CardAction;
    @Input() selected: boolean = true;

    text(key: string): string {
        return UITextUtil.getText(key);
    }

    get cardSrc(): string {
        switch ((<any>CardType)[this.card]) {
            case CardType.Joker: return 'assets/img/cards/joker.png';
            case CardType.PassTurn: return 'assets/img/cards/Interdiction.png';
            case CardType.Points: return 'assets/img/cards/bonus.png';
            case CardType.RemoveTime: return 'assets/img/cards/plus_rapide.png';
            case CardType.Steal: return 'assets/img/cards/communisme.png';
            case CardType.SwapLetter: return 'assets/img/cards/echange.png';
            case CardType.SwapRack: return 'assets/img/cards/vol.png';
            case CardType.TransformTile: return 'assets/img/cards/transmutation.png';
        }

        return '';
    }

    get cardContent(): string {
        if (this.cardAction) {
            switch ((<any>CardType)[this.card]) {
                case CardType.Joker:
                    if (this.cardAction.cardChoice == undefined) {
                        return 'Error';
                    }
                    return `<span class="c"><b>${this.cardAction.user}</b><br/>${this.text('used')}<br/><b>${this.title}</b><br/>${this.text(
                        'andChose',
                    )}<br/><b>${this.convertCardTitle(CardType[this.cardAction.cardChoice])}</b></span>`;
                case CardType.PassTurn:
                    if (this.cardAction.turnPassedOf == undefined) {
                        return this.text('error');
                    }
                    return `<span class="c"><b>${this.cardAction.user}</b><br/>${this.text('used')}<br/><b>${this.title}</b><br/><b>${
                        this.cardAction.turnPassedOf
                    }</b> ${this.text('skipsTheirTurn')}</span>`;
                case CardType.Points:
                    if (this.cardAction.bonusPoints == undefined) {
                        return this.text('error');
                    }
                    return `<span class="c"><b>${this.cardAction.user}</b><br/>${this.text('used')}<br/><b>${this.title}</b><br/><b>${
                        this.cardAction.bonusPoints
                    }</b> ${this.text('bonusPoints')}</span>`;
                case CardType.RemoveTime:
                    return `<span class="c"><b>${this.cardAction.user}</b><br/>${this.text('used')}<br/><b>${
                        this.title
                    }</b><br/>Les autres joueurs auront moins de temps!</span>`;
                case CardType.Steal:
                    if (this.cardAction.bestPlayers == undefined || this.cardAction.pointsForEach == undefined) {
                        return this.text('error');
                    }
                    return `<span class="c"><b>${this.cardAction.user}</b><br/>${this.text('used')}<br/><b>${
                        this.title
                    }</b><br/><b>${this.cardAction.bestPlayers.join('<br/>')}</b><br/> ${
                        this.cardAction.bestPlayers.length > 1 ? this.text('peopleLoseAllTheirPoints') : this.text('personLosesAllTheirPoints')
                    }<br/>${this.text('and')}<b>${this.cardAction.pointsForEach}</b> ${this.text('pointsAreDistributedToEveryone')}</span>`;
                case CardType.SwapLetter:
                    if (this.cardAction.letterFromRack == undefined || this.cardAction.letterToGet == undefined) {
                        return this.text('error');
                    }
                    return `<span class="c"><b>${this.cardAction.user}</b><br/>${this.text('used')}<br/><b>${this.title}</b><br/><b>${
                        this.cardAction.letterToGet.char
                    }</b> contre <b>${this.cardAction.letterFromRack.char}</b>!</span>`;
                case CardType.SwapRack:
                    if (this.cardAction.playerToSwap == undefined) {
                        return this.text('error');
                    }
                    return `<span class="c"><b>${this.cardAction.user}</b><br/>${this.text('used')}<br/><b>${this.title}</b><br/>${this.text(
                        'for',
                    )}<br/><b>${this.cardAction.playerToSwap}</b>!</span>`;
                case CardType.TransformTile:
                    if (this.cardAction.tileToTransformX == undefined || this.cardAction.tileToTransformY == undefined) {
                        return this.text('error');
                    }

                    if (this.cardAction.wordMultiplicator != undefined) {
                        return `<span class="c"><b>${this.cardAction.user}</b><br/>${this.text('used')}<br/><b>${this.title}</b><br/>${this.text(
                            'theSquare',
                        )}<br/><b>${'ABCDEFGHIJKLMNO'.charAt(this.cardAction.tileToTransformY)}${this.cardAction.tileToTransformX}</b><br/>${this.text(
                            'becomes',
                        )}<br/><b>x${this.cardAction.wordMultiplicator} ${this.text('word')}</b>!</span>`;
                    } else if (this.cardAction.letterMultiplicator != undefined) {
                        return `<span class="c"><b>${this.cardAction.user}</b><br/>${this.text('used')}<br/><b>${this.title}</b><br/>${this.text(
                            'theSquare',
                        )}<br/><b>${'ABCDEFGHIJKLMNO'.charAt(this.cardAction.tileToTransformY)}${this.cardAction.tileToTransformX}</b><br/>${this.text(
                            'becomes',
                        )}<br/><b>x${this.cardAction.letterMultiplicator} ${this.text('letter')}</b>!</span>`;
                    }

                    return this.text('error');
            }
            return '';
        } else {
            return '';
        }
    }

    get title(): string {
        return this.convertCardTitle(this.card);
    }

    get description(): string {
        return CardUtil.description((<any>CardType)[this.card]);
    }

    private convertCardTitle(title: string) {
        return CardUtil.title((<any>CardType)[title]);
    }

    click() {
        this.cardClicked.emit();
    }
}
