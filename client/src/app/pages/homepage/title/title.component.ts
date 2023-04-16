import { Component } from '@angular/core';
import { Letter } from '@app/game-logic/game/board/letter.interface';

@Component({
    selector: 'app-title',
    templateUrl: './title.component.html',
    styleUrls: ['./title.component.scss'],
})
export class TitleComponent {
    readonly letters: Letter[] = [
        { char: 'C', value: 3 },
        { char: 'R', value: 1 },
        { char: 'A', value: 1 },
        { char: 'B', value: 3 },
        { char: 'B', value: 3 },
        { char: 'L', value: 1 },
    ];

    constructor() {}
}
