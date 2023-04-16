import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConnectionStatisticsEntry } from '@app/interfaces/connection-statistics-entry.interface';
import { CommunicationService } from '@app/services/communication.service';
import { UITextUtil } from '@app/services/ui-text-util';
import { UserProfileService } from '@app/services/user-profile.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-connection-statistics',
    templateUrl: './connection-statistics.component.html',
    styleUrls: ['./connection-statistics.component.scss'],
})
export class ConnectionStatisticsComponent implements OnInit, OnDestroy {
    connectionStatistics: ConnectionStatisticsEntry[];
    errorMessage: string;
    statSubscription: Subscription;
    constructor(private communication: CommunicationService, private userProfile: UserProfileService) {}

    ngOnInit(): void {
        const username = this.userProfile.loginInfo?.username;
        if (username == undefined) this.errorMessage = 'Erreur: il faut être connecté';
        else
            this.statSubscription = this.communication.getConnectionStatistics(username).subscribe((response) => {
                if (response == undefined) this.errorMessage = 'Erreur lors de la requête au serveur';
                else this.connectionStatistics = response.entries;
            });
    }

    text(key: string): string {
        return UITextUtil.getText(key);
    }

    isStatsLoading(): boolean {
        return this.connectionStatistics == undefined && this.errorMessage == undefined;
    }

    ngOnDestroy(): void {
        this.statSubscription.unsubscribe();
    }
}
