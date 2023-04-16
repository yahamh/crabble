import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Letter } from '@app/game-logic/game/board/letter.interface';
import { GameInfoService } from '@app/game-logic/game/game-info/game-info.service';
import { UITextUtil } from '@app/services/ui-text-util';

@Component({
    selector: 'app-letter-swap',
    templateUrl: './letter-swap.component.html',
    styleUrls: ['./letter-swap.component.scss'],
})
export class LetterSwapComponent implements OnInit {
    @Output() lettersChosen = new EventEmitter<{ letterFromRack: Letter; letterToGet: Letter }>();
    @Output() closed = new EventEmitter();

    step = 0;
    letterFromRack: Letter;
    letterToGet: Letter;

    constructor(private info: GameInfoService) {}

    text(key: string): string {
        return UITextUtil.getText(key);
    }

    ngOnInit(): void {
        this.step = 0;
    }

    get lettersToShow(): Letter[] {
        switch (this.step) {
            case 0:
                return this.rack;
            case 1:
                return this.letterListWithoutDoubles;
        }
        return [];
    }

    get letterList(): Letter[] {
        return this.info.letterList;
    }

    get letterListWithoutDoubles(): Letter[] {
        const withoutDups: Letter[] = [];
        for (const letter of this.letterList) {
            if (!withoutDups.find((value) => value.char == letter.char)) {
                withoutDups.push(letter);
            }
        }
        return withoutDups;
    }

    get rack(): Letter[] {
        return this.info.user.letterRack;
    }

    select(letter: Letter) {
        if (this.step == 0) {
            this.letterFromRack = letter;
            this.step++;
        } else {
            this.letterToGet = letter;
            this.lettersChosen.emit({
                letterFromRack: this.letterFromRack,
                letterToGet: this.letterToGet,
            });
        }
    }

    close() {
        this.closed.emit();
    }
}
