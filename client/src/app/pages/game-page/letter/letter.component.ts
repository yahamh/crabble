import { Component, Input } from '@angular/core';
import { Letter } from '@app/game-logic/game/board/letter.interface';

@Component({
    selector: 'app-letter',
    templateUrl: './letter.component.html',
    styleUrls: ['./letter.component.scss']
})
export class LetterComponent {

    @Input() letter: Letter
    @Input() isHoverable: boolean = true

    constructor() { }

}
