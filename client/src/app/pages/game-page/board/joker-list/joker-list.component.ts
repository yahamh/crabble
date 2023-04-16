import { Component, EventEmitter, Output } from '@angular/core';
import { Letter } from '@app/game-logic/game/board/letter.interface';

@Component({
    selector: 'app-joker-list',
    templateUrl: './joker-list.component.html',
    styleUrls: ['./joker-list.component.scss']
})
export class JokerListComponent {

    readonly letters:Letter[] = [
        {char: "A", value: 0},
        {char: "B", value: 0},
        {char: "C", value: 0},
        {char: "D", value: 0},
        {char: "E", value: 0},
        {char: "F", value: 0},
        {char: "G", value: 0},
        {char: "H", value: 0},
        {char: "I", value: 0},
        {char: "J", value: 0},
        {char: "K", value: 0},
        {char: "L", value: 0},
        {char: "M", value: 0},
        {char: "N", value: 0},
        {char: "O", value: 0},
        {char: "P", value: 0},
        {char: "Q", value: 0},
        {char: "R", value: 0},
        {char: "S", value: 0},
        {char: "T", value: 0},
        {char: "U", value: 0},
        {char: "V", value: 0},
        {char: "W", value: 0},
        {char: "X", value: 0},
        {char: "Y", value: 0},
        {char: "Z", value: 0},
    ]

    @Output() letter = new EventEmitter<Letter>()

    constructor() { }

    click(index: number) {
        this.letter.emit(this.letters[index])
    }

}
