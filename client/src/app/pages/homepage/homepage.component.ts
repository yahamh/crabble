import { ChangeDetectorRef, Component } from '@angular/core';
import { ElectronService } from '@app/services/electron.service';
import { UserProfileService } from '@app/services/user-profile.service';

@Component({
    selector: 'app-homepage',
    templateUrl: './homepage.component.html',
    styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent {
    isChatDocked = true;

    get isLoggedIn(): boolean {
        return this.userProfile.isLoggedIn();
    }

    constructor(private userProfile: UserProfileService, private electron: ElectronService, private changeDetectorRef: ChangeDetectorRef) {
        this.isChatDocked = this.electron.isChatDocked;
        this.electron.chatVisibilityChanged$.subscribe(value => {
            this.isChatDocked = value;
            this.changeDetectorRef.detectChanges();
        })
    }
}
