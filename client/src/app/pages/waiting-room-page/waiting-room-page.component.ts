import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameManagerService } from '@app/game-logic/game/games/game-manager/game-manager.service';
import { ElectronService } from '@app/services/electron.service';
import { UITextUtil } from '@app/services/ui-text-util';
import { UserProfileService } from '@app/services/user-profile.service';
import { OnlineGameSettings } from '@app/socket-handler/interfaces/game-settings-multi.interface';
import { UserAuth } from '@app/socket-handler/interfaces/user-auth.interface';
import { NewOnlineGameSocketHandler } from '@app/socket-handler/new-online-game-socket-handler/new-online-game-socket-handler.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-waiting-room-page',
    templateUrl: 'waiting-room-page.component.html',
    styleUrls: ['waiting-room-page.component.scss'],
})
export class WaitingRoomPageComponent implements OnInit, OnDestroy {
    readonly UIText = UITextUtil;

    isChatDocked = true;

    players: string[] = [];
    username: string = ""

    private pendingGameId$$: Subscription | undefined;
    private players$$: Subscription | undefined;
    private startGame$$: Subscription | undefined;
    private isDisconnected$$: Subscription | undefined;

    constructor(
        public newGameSocket: NewOnlineGameSocketHandler,
        private router: Router,
        private gameManager: GameManagerService,
        private profileService: UserProfileService,
        private electron: ElectronService,
        private changeDetectorRef: ChangeDetectorRef 
    ) {
        this.isChatDocked = this.electron.isChatDocked;
        this.electron.chatVisibilityChanged$.subscribe(value => {
            this.isChatDocked = value;
            this.changeDetectorRef.detectChanges();
        })
    }

    ngOnDestroy(): void {
        this.pendingGameId$$?.unsubscribe();
        this.players$$?.unsubscribe();
        this.startGame$$?.unsubscribe();
        this.isDisconnected$$?.unsubscribe();

        this.pendingGameId$$ = undefined;
        this.players$$ = undefined;
        this.startGame$$ = undefined;
        this.isDisconnected$$ = undefined;

        this.players = [];
    }

    ngOnInit(): void {
        this.players = [this.profileService.loginInfo?.username!];
        this.username = this.profileService.loginInfo?.username!;

        this.pendingGameId$$ = this.newGameSocket.pendingGameId$.subscribe(id => {
            if(this.newGameSocket.currentGameSettings) {
                this.newGameSocket.currentGameSettings.id = id;
            }
        });

        this.players$$ = this.newGameSocket.players$.subscribe(players => {
            this.players = players;
        });

        this.startGame$$ = this.newGameSocket.startGame$.subscribe(gameSettings => {
            if(gameSettings) {
                this.pendingGameId$$?.unsubscribe();
                this.players$$?.unsubscribe();
                this.startGame$$?.unsubscribe();
                this.isDisconnected$$?.unsubscribe();

                this.pendingGameId$$ = undefined;
                this.players$$ = undefined;
                this.startGame$$ = undefined;
                this.isDisconnected$$ = undefined;

                this.startOnlineGame(gameSettings);
            }
        });

        this.isDisconnected$$ = this.newGameSocket.isDisconnected$.subscribe(disconnected => {
            if(disconnected) {
                this.newGameSocket.disconnectSocket();
                this.router.navigate(['/home'])
            }
        });
    }

    get canPlay(): boolean {
        return this.newGameSocket.currentGameSettings?.id != "" && this.players.length > 1
    }

    kickPlayer(player: string) {
        this.newGameSocket.kickPlayer(this.newGameSocket.currentGameSettings?.id!, player);
    }

    play() {
        this.newGameSocket.startGame(this.newGameSocket.currentGameSettings?.id!);
    }
    
    cancel() {
        this.newGameSocket.disconnectSocket();
        this.router.navigate(['/home']);
    }

    private startOnlineGame(settings: OnlineGameSettings) {
        const gameToken = settings.id;
        const userAuth: UserAuth = { playerName: this.username, gameToken: gameToken };
        this.newGameSocket.resetGameToken();
        this.gameManager.joinOnlineGame(userAuth, settings);
        this.router.navigate(['/game']);
    }
}
