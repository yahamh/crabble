import { Component, OnInit } from '@angular/core';
import { GameInfoService } from '@app/game-logic/game/game-info/game-info.service';
import { UITextUtil } from '@app/services/ui-text-util';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export const MILISECONDS_IN_MINUTE = 60000;
export const FLOAT_TO_PERCENT = 100;
@Component({
    selector: 'app-info-box',
    templateUrl: './info-box.component.html',
    styleUrls: ['./info-box.component.scss'],
})
export class InfoBoxComponent implements OnInit {
    timeLeft$: Observable<number | undefined>;
    timeLeftPercent$: Observable<number | undefined>;

    constructor(private info: GameInfoService) {}

    text(key: string): string {
        return UITextUtil.getText(key);
    }

    ngOnInit() {
        this.timeLeft$ = this.info.timeLeftForTurn.pipe(
            map((value: number | undefined) => {
                if (value === undefined) {
                    return;
                }
                return value;
            }),
        );
        this.timeLeftPercent$ = this.info.timeLeftPercentForTurn.pipe(
            map((value: number | undefined) => {
                if (value === undefined) {
                    return;
                }
                return value * FLOAT_TO_PERCENT;
            }),
        );
    }

    displayNumberOfLettersRemaining(): string {
        return UITextUtil.language == 'fr'
            ? `Il reste ${this.info.numberOfLettersRemaining} lettres dans le sac`
            : `${this.info.numberOfLettersRemaining} letters remain in the bag`;
    }
}
