import { Component } from '@angular/core';
import { GameInfoService } from '@app/game-logic/game/game-info/game-info.service';
import { GameSocketHandlerService } from '@app/socket-handler/game-socket-handler/game-socket-handler.service';

@Component({
    selector: 'app-reaction-choice',
    templateUrl: './reaction-choice.component.html',
    styleUrls: ['./reaction-choice.component.scss']
})
export class ReactionChoiceComponent {

    readonly emojis: string[] = [
        "👍",
        "❤️",
        "👏",
        "😱",
        "😡",
        "👋"
    ]

    preview: string = this.emojis[Math.floor(Math.random()*this.emojis.length)];

    isListShown = false;

    get emojisWithPreviewFirst(): string[] {
        return [this.preview, ...this.emojis.filter(value => value != this.preview)]
    }

    constructor(private gameSocketHandlerService: GameSocketHandlerService, private info: GameInfoService) {}

    mouseEnterPreview() {
        this.preview = this.emojis.filter(value => value != this.preview)[Math.floor(Math.random()*(this.emojis.length-1))];
    }

    showList() {
        this.isListShown = true;
    }

    mouseExitChoice() {
        this.isListShown = false;
    }

    selectReaction(emoji: string) {
        this.isListShown = false;
        console.log("on a bien reagi")
        this.gameSocketHandlerService.react(emoji, this.info.isObserving ? "OB" : this.info.user.name);
    }

}
