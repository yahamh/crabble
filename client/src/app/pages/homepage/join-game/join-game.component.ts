import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CardUtil } from '@app/game-logic/cards/card-utils';
import { GameManagerService } from '@app/game-logic/game/games/game-manager/game-manager.service';
import { CardType } from '@app/game-logic/game/games/online-game/game-state';
import { UITextUtil } from '@app/services/ui-text-util';
import { UserProfileService } from '@app/services/user-profile.service';
import { OnlineGameSettings } from '@app/socket-handler/interfaces/game-settings-multi.interface';
import { NewOnlineGameSocketHandler } from '@app/socket-handler/new-online-game-socket-handler/new-online-game-socket-handler.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-join-game',
    templateUrl: './join-game.component.html',
    styleUrls: ['./join-game.component.scss'],
})
export class JoinGameComponent implements OnInit, OnDestroy {
    
    @Input() observableGames: boolean = false;

    gameSettings: OnlineGameSettings[] = [];
    askingForPassword: Map<string, boolean> = new Map();
    password: string = '';
    error: boolean = false;

    pendingGames$$: Subscription;
    gameObserved$$: Subscription;

    get title(): string {
        return this.observableGames ? this.text('observeGame') : this.text('joinAGame');
    }

    constructor(
        private onlineSocketHandler: NewOnlineGameSocketHandler,
        private router: Router,
        private changeDetector: ChangeDetectorRef,
        private userProfile: UserProfileService,
        private gameManager: GameManagerService
    ) {}

    text(key: string): string {
        return UITextUtil.getText(key);
    }

    ngOnDestroy(): void {
        this.pendingGames$$?.unsubscribe();
        this.gameObserved$$?.unsubscribe();
    }

    ngOnInit(): void {
        this.pendingGames$$?.unsubscribe();
        this.gameObserved$$?.unsubscribe();
        if(this.observableGames) {
            this.pendingGames$$ = this.onlineSocketHandler.observableGames$.subscribe((gameSettings) => {
                this.gameSettings = gameSettings;
                for (const gameSetting of this.gameSettings) {
                    if (!this.askingForPassword.has(gameSetting.id)) {
                        this.askingForPassword.set(gameSetting.id, false);
                    }
                }

                for (const key of this.askingForPassword.keys()) {
                    if (!this.gameSettings.find((value) => value.id == key)) {
                        this.askingForPassword.delete(key);
                    }
                }
            });

            this.gameObserved$$ = this.onlineSocketHandler.gameObserved$.subscribe(settings => {
                this.gameManager.observeGame({
                    gameToken: settings.id,
                    playerName: this.userProfile.loginInfo?.username as string
                }, settings)
                this.router.navigate(['/game']);
            })

            this.onlineSocketHandler.listenForObservableGames();
        }
        else {
            this.pendingGames$$ = this.onlineSocketHandler.pendingGames$.subscribe((gameSettings) => {
                this.gameSettings = gameSettings;
                for (const gameSetting of this.gameSettings) {
                    if (!this.askingForPassword.has(gameSetting.id)) {
                        this.askingForPassword.set(gameSetting.id, false);
                    }
                }

                for (const key of this.askingForPassword.keys()) {
                    if (!this.gameSettings.find((value) => value.id == key)) {
                        this.askingForPassword.delete(key);
                    }
                }
            });
            this.onlineSocketHandler.listenForPendingGames();
        }
    }

    isLoggedIn(): boolean {
        return this.userProfile.loginInfo != null;
    }

    get Math(): Math {
        return Math;
    }

    convertCardsToString(cards: CardType[]) {
        return cards.map((value) => CardUtil.title(value)).join('\n');
    }

    convertCardTypeToString(cardType: CardType): string {
        return CardType[cardType];
    }

    play(gameSetting: OnlineGameSettings) {
        if (this.isLoggedIn()) {
            if (gameSetting.password.length != 0 && !this.askingForPassword.get(gameSetting.id)) {
                this.askingForPassword.set(gameSetting.id, true);
                this.changeDetector.detectChanges();
                (document.getElementById(`${gameSetting.id}_pass`) as HTMLInputElement).focus();
                return;
            } else if (gameSetting.password.length != 0 && this.askingForPassword.get(gameSetting.id) && this.password != gameSetting.password) {
                this.error = true;
                setTimeout(() => {
                    this.error = false;
                }, 1000);
                return;
            }

            let username = this.userProfile.loginInfo?.username as string;

            if(this.observableGames) {
                this.onlineSocketHandler.observeGame(gameSetting.id, username);
            }
            else {
                this.onlineSocketHandler.joinPendingGame(gameSetting, username);
                this.router.navigate(['/waiting-room']);
            }
        }
    }

    timeout: NodeJS.Timeout;
    onFocusLost() {
        this.timeout = setTimeout(() => {
            this.resetAskingForPassword();
            this.password = '';
        }, 100);
    }

    onClickSend(gameSetting: OnlineGameSettings) {
        clearTimeout(this.timeout);
        (document.getElementById(`${gameSetting.id}_pass`) as HTMLInputElement).focus();
    }
    
    private resetAskingForPassword() {
        for (const id of this.askingForPassword.keys()) {
            this.askingForPassword.set(id, false);
        }
    }
}
