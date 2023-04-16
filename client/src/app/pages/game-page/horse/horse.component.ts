import { AfterContentChecked, Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { UIInputControllerService } from '@app/game-logic/actions/ui-actions/ui-input-controller.service';
import { UIPlace } from '@app/game-logic/actions/ui-actions/ui-place';
import { Letter } from '@app/game-logic/game/board/letter.interface';
import { GameInfoService } from '@app/game-logic/game/game-info/game-info.service';
import { InputComponent, InputType } from '@app/game-logic/interfaces/ui-input';
import { DragAndDropService } from '@app/services/drag-and-drop.service';

@Component({
    selector: 'app-horse',
    templateUrl: './horse.component.html',
    styleUrls: ['./horse.component.scss'],
})
export class HorseComponent implements AfterContentChecked {

    @Input() playerSelected: string = "";

    @Output() clickLetter = new EventEmitter();
    readonly self = InputComponent.Horse;

    inputType = InputType;

    playerRack: Letter[];

    x: number;
    y: number;

    constructor(private info: GameInfoService, public dragAndDropService: DragAndDropService, private inputService: UIInputControllerService) {}

    @HostListener('document:mousemove', ['$event'])
    onMouseMove(event: MouseEvent) {
        this.x = event.x;
        this.y = event.y;
    }

    ngAfterContentChecked(): void {
        if(this.info.isObserving) {
            if(this.playerSelected == "") {
                this.playerSelected = this.info.players[0].name;
            }

            this.playerRack = this.info.players.find(value => value.name == this.playerSelected)?.letterRack ?? [];
        }
        else {
            this.playerRack = this.info.user.letterRack;
        }
    }

    mouseDown(index: number) {
        if(this.info.activePlayer != this.info.user || (this.inputService.activeAction instanceof UIPlace && this.inputService.activeAction.concernedIndexes.size != 0)) {
            return;
        }

        this.inputService.discardAction()

        if(!this.dragAndDropService.placedLetters.find(value => value.index == index)) {
            this.dragAndDropService.movingLetter = {
                index: index,
                letter: {
                    char: this.playerRack[index].char,
                    value: this.playerRack[index].value
                }
            }
        }
    }

    isPlacedOrMoving(index: number) {
        if (this.inputService.activeAction instanceof UIPlace) {
            return this.inputService.activeAction.concernedIndexes.has(index);
        }
        return this.dragAndDropService.placedLetters.find(value => value.index == index) || this.dragAndDropService.movingLetter?.index == index
    }
}
