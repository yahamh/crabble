import { Component, EventEmitter, Output } from '@angular/core';
import { GameInfoService } from '@app/game-logic/game/game-info/game-info.service';

@Component({
    selector: 'app-exchange',
    templateUrl: './exchange.component.html',
    styleUrls: ['./exchange.component.scss']
})
export class ExchangeComponent {
    @Output() closed = new EventEmitter();
    @Output() exchanged = new EventEmitter<number[]>()

    selected:number[] = []

    constructor(public info: GameInfoService) {}

    click(index: number) {
        if(this.selected.find(value => value == index) != undefined) {
            this.selected = this.selected.filter(value => value != index)
        }
        else {
            this.selected.push(index);
        }
    }

    isSelected(index: number) {
        return this.selected.find(value => value == index) != undefined
    }

    close() {
        this.closed.emit()
    }

    exchange() {
        this.exchanged.emit(this.selected)
    }

}
