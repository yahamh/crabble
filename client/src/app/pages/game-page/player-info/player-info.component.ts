import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GameInfoService } from '@app/game-logic/game/game-info/game-info.service';
import { Player } from '@app/game-logic/player/player';
import { UITextUtil } from '@app/services/ui-text-util';

@Component({
    selector: 'app-player-info',
    templateUrl: './player-info.component.html',
    styleUrls: ['./player-info.component.scss'],
})
export class PlayerInfoComponent implements OnInit {
    @Input() playerSelected: string = "";
    @Output() selectPlayer = new EventEmitter<string>();

    constructor(private info: GameInfoService) {}

    ngOnInit(): void {
        this.playerSelected = this.info.players[0].name;
    }

    text(key: string): string {
        return UITextUtil.getText(key);
    }

    get isSelectable(): boolean {
        return this.info.isObserving;
    }

    get myName(): string {
        return this.info.user.name;
    }

    get activePlayerName(): string {
        return this.info.activePlayer.name;
    }

    get players(): Player[] {
        return this.info.players;
    }

    get lettersRemaining(): number {
        return this.info.numberOfLettersRemaining;
    }

    get observers(): string[] {
        return this.info.observers;
    }

    click(player: string) {
        if(this.isSelectable) {
            this.selectPlayer.emit(player);
        }
    }
}
