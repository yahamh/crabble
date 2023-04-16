import { Component, ViewChild } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import {
    DEFAULT_CAPACITY,
    DEFAULT_DICTIONARY_TITLE,
    MAX_CAPACITY,
    MAX_TIME_PER_TURN,
    MIN_CAPACITY,
    MIN_TIME_PER_TURN,
    STEP_TIME_PER_TURN
} from '@app/game-logic/constants';
import { CardType } from '@app/game-logic/game/games/online-game/game-state';
import { UITextUtil } from '@app/services/ui-text-util';
import { UserProfileService } from '@app/services/user-profile.service';
import { GameMode } from '@app/socket-handler/interfaces/game-mode.interface';
import { OnlineGameSettingsUI } from '@app/socket-handler/interfaces/game-settings-multi.interface';
import { NewOnlineGameSocketHandler } from '@app/socket-handler/new-online-game-socket-handler/new-online-game-socket-handler.service';
import { CardListComponent } from './card-list/card-list.component';

@Component({
    selector: 'app-create-game',
    templateUrl: './create-game.component.html',
    styleUrls: ['./create-game.component.scss'],
})
export class CreateGameComponent {
    @ViewChild(CardListComponent) cardListComponent: CardListComponent;

    timer: number = 60000;
    arePowersEnabled: boolean = false;
    isPrivate = false;
    password = '';

    minCapacity = MIN_CAPACITY;
    maxCapacity = MAX_CAPACITY;

    minTimePerTurn = MIN_TIME_PER_TURN;
    maxTimePerTurn = MAX_TIME_PER_TURN;
    stepTimePerTurn = STEP_TIME_PER_TURN;

    private selectedCards: CardType[] = [];

    constructor(
        private router: Router,
        private socketHandler: NewOnlineGameSocketHandler,
        private userProfile: UserProfileService,
    ) {}

    text(key: string): string {
        return UITextUtil.getText(key);
    }

    isLoggedIn(): boolean {
        return this.userProfile.loginInfo != null;
    }

    onSelectedCardsChanged(selectedCards: CardType[]) {
        this.selectedCards = selectedCards;
        if (this.selectedCards.length > 0) {
            this.arePowersEnabled = true;
        } else {
            this.arePowersEnabled = false;
        }
    }

    playGame() {
        const settings: OnlineGameSettingsUI = {
            capacity: DEFAULT_CAPACITY,
            dictTitle: DEFAULT_DICTIONARY_TITLE,
            randomBonus: false,
            timePerTurn: this.timer,
            cards: this.selectedCards,
            dictDesc: '',
            gameMode: this.arePowersEnabled ? GameMode.Power : GameMode.Classic,
            players: [this.userProfile.loginInfo?.username as string],
            isPrivate: this.isPrivate,
            password: this.password,
        };
        this.socketHandler.createGameMulti(settings);
        this.router.navigate(['/waiting-room']);
    }

    onPowerEnabledChanged(value: MatCheckboxChange) {
        this.arePowersEnabled = value.checked;
        if (value.checked) {
            this.selectedCards = this.cardListComponent.enableAll();
        } else {
            this.selectedCards = this.cardListComponent.disabledAll();
        }
    }
}
