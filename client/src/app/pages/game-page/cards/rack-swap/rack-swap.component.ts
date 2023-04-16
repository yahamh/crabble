import { Component, EventEmitter, Output } from '@angular/core';
import { GameInfoService } from '@app/game-logic/game/game-info/game-info.service';
import { UITextUtil } from '@app/services/ui-text-util';

@Component({
    selector: 'app-rack-swap',
    templateUrl: './rack-swap.component.html',
    styleUrls: ['./rack-swap.component.scss'],
})
export class RackSwapComponent {
    @Output() playerSelected = new EventEmitter<string>();
    @Output() closed = new EventEmitter();

    constructor(private info: GameInfoService) {}

    text(key: string): string {
        return UITextUtil.getText(key);
    }

    get players(): string[] {
        return this.info.players.map((value) => value.name).filter((value) => value != this.info.user.name);
    }

    select(player: string) {
        this.playerSelected.emit(player);
    }

    close() {
        this.closed.emit();
    }
}
