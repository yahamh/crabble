import { Subject } from 'rxjs';
import { CardAction, CardType } from '../interface/game-state.interface';
import { Card } from './card';
import { CardJoker } from './card-joker';
import { CardPassTurn } from './card-pass-turn';
import { CardPoints } from './card-points';
import { CardRemoveTime } from './card-remove-time';
import { CardSteal } from './card-steal';
import { CardSwapLetter } from './card-swap-letter';
import { CardSwapRack } from './card-swap-rack';
import { CardTransformTile } from './card-transform-tile';

export class CardManager {
    private currentCardEffects: Card[] = [];

    constructor(private cardActionSubject: Subject<Card>, readonly cardsAvailable: CardType[]) {}

    useCard(cardAction: CardAction) {
        let card: Card;

        switch (cardAction.card) {
            case CardType.PassTurn:
                card = new CardPassTurn(this.cardActionSubject, cardAction.user);
                this.currentCardEffects.push(card);
                break;
            case CardType.RemoveTime:
                card = new CardRemoveTime(this.cardActionSubject, cardAction.user);
                this.currentCardEffects.push(card);
                break;
            case CardType.Steal:
                card = new CardSteal(this.cardActionSubject, cardAction.user);
                break;
            case CardType.SwapLetter:
                if (!cardAction.letterFromRack || !cardAction.letterToGet) {
                    return;
                }

                card = new CardSwapLetter(this.cardActionSubject, cardAction.user, cardAction.letterFromRack, cardAction.letterToGet);
                break;
            case CardType.SwapRack:
                if (!cardAction.playerToSwap) {
                    return;
                }

                card = new CardSwapRack(this.cardActionSubject, cardAction.user, cardAction.playerToSwap);
                break;
            case CardType.TransformTile:
                if (cardAction.tileToTransformX == undefined || cardAction.tileToTransformY == undefined) {
                    return;
                }

                card = new CardTransformTile(this.cardActionSubject, cardAction.user, cardAction.tileToTransformX, cardAction.tileToTransformY);
                break;
            case CardType.Points:
                card = new CardPoints(this.cardActionSubject, cardAction.user);
                break;
            case CardType.Joker:
                if (cardAction.cardChoice == undefined) {
                    return;
                }

                card = new CardJoker(this.cardActionSubject, cardAction.user, cardAction.cardChoice);
                break;
        }

        card.onUse();
    }

    shouldPassTurn(): boolean {
        const passTurnCard = this.currentCardEffects.find((value) => value.cardType == CardType.PassTurn);
        if (passTurnCard) {
            this.currentCardEffects = this.currentCardEffects.filter((value) => value != passTurnCard);
            return true;
        }
        return false;
    }

    dividerRemoveTime(currentPlayerName: string): number {
        let divider = 0;
        const removeTimeCards = this.currentCardEffects.filter((value) => value.cardType == CardType.RemoveTime);
        for (const card of removeTimeCards) {
            if (card.user != currentPlayerName) {
                divider++;
            } else {
                this.currentCardEffects = this.currentCardEffects.filter((value) => value != card);
            }
        }
        return divider;
    }
}
