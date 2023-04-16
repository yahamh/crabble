import { Component } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { UITextUtil } from '@app/services/ui-text-util';
import { UserProfileService } from '@app/services/user-profile.service';

@Component({
    selector: 'app-username-edition',
    templateUrl: './username-edition.component.html',
    styleUrls: ['./username-edition.component.scss'],
})
export class UsernameEditionComponent {
    newUsername: string;
    responseMessage: string;
    constructor(private userProfile: UserProfileService, private communication: CommunicationService) {
        this.newUsername = '';
    }

    text(key: string): string {
        return UITextUtil.getText(key);
    }

    isValid(): boolean {
        const isCurrentName = (this.userProfile.loginInfo?.username as string) == this.newUsername;
        return !isCurrentName && this.newUsername.length >= 3 && this.newUsername.length <= 30;
    }

    async submitNameChange(): Promise<void> {
        this.responseMessage = '';
        if (this.userProfile.loginInfo != null)
            if (await this.communication.editUsername(this.userProfile.loginInfo, this.newUsername).toPromise()) {
                this.userProfile.editUsername(this.newUsername);
                this.responseMessage = this.text('successfulNameChange');
            } else {
                this.responseMessage = this.text('serverError');
            }
    }
}
