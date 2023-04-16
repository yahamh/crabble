import { Component, OnInit } from '@angular/core';
import { GameStatisticsResponse } from '@app/interfaces/game-statistics-response.interface';
import { CommunicationService } from '@app/services/communication.service';
import { UITextUtil } from '@app/services/ui-text-util';
import { UserProfileService } from '@app/services/user-profile.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-game-statistics',
    templateUrl: './game-statistics.component.html',
    styleUrls: ['./game-statistics.component.scss'],
})
export class GameStatisticsComponent implements OnInit {
    gameStatistics: GameStatisticsResponse;
    errorMessage: string;
    statSubscription: Subscription;
    constructor(private communication: CommunicationService, private userProfile: UserProfileService) {}

    ngOnInit(): void {
        const username = this.userProfile.loginInfo?.username;
        if (username == undefined) this.errorMessage = 'Erreur: il faut être connecté';
        else
            this.statSubscription = this.communication.getGameStatistics(username).subscribe((response) => {
                if (response == undefined) this.errorMessage = 'Erreur lors de la requête au serveur';
                else this.gameStatistics = response;
            });
    }

    text(key: string): string {
        return UITextUtil.getText(key);
    }

    isStatsLoading(): boolean {
        return this.gameStatistics == undefined && this.errorMessage == undefined;
    }

    ngOnDestroy(): void {
        this.statSubscription.unsubscribe();
    }
}
