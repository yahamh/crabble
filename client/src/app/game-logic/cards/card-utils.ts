import { UITextUtil } from '@app/services/ui-text-util';
import { CardType } from '../game/games/online-game/game-state';

export class CardUtil {
    static description(card: CardType): string {
        switch (card) {
            case CardType.Joker:
                return UITextUtil.getText("cardDescriptionJoker");
            case CardType.PassTurn:
                return UITextUtil.getText("cardDescriptionPassTurn");
            case CardType.Points:
                return UITextUtil.getText("cardDescriptionPoints");
            case CardType.RemoveTime:
                return UITextUtil.getText("cardDescriptionRemoveTime");
            case CardType.Steal:
                return UITextUtil.getText("cardDescriptionSteal");
            case CardType.SwapLetter:
                return UITextUtil.getText("cardDescriptionSwapLetter");
            case CardType.SwapRack:
                return UITextUtil.getText("cardDescriptionSwapRack");
            case CardType.TransformTile:
                return UITextUtil.getText("cardDescriptionTransformTile");
        }
    }

    static title(card: CardType) {
        switch (card) {
            case CardType.Joker:
                return UITextUtil.getText("cardTitleJoker");
            case CardType.PassTurn:
                return UITextUtil.getText("cardTitlePassTurn");
            case CardType.Points:
                return UITextUtil.getText("cardTitlePoints");
            case CardType.RemoveTime:
                return UITextUtil.getText("cardTitleRemoveTime");
            case CardType.Steal:
                return UITextUtil.getText("cardTitleSteal");
            case CardType.SwapLetter:
                return UITextUtil.getText("cardTitleSwapLetter");
            case CardType.SwapRack:
                return UITextUtil.getText("cardTitleSwapRack");
            case CardType.TransformTile:
                return UITextUtil.getText("cardTitleTransformTile");
        }
    }
}
