import { Component } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { UITextUtil } from '@app/services/ui-text-util';
import { UserProfileService } from '@app/services/user-profile.service';
import { LoginInfo } from '@app/socket-handler/interfaces/login-info';

@Component({
    selector: 'app-profile-picture-edition',
    templateUrl: './profile-picture-edition.component.html',
    styleUrls: ['./profile-picture-edition.component.scss'],
})
export class ProfilePictureEditionComponent {
    image: string;
    responseMessage: string;

    constructor(private communication: CommunicationService, private profile: UserProfileService) {}

    text(key: string): string {
        return UITextUtil.getText(key);
    }

    async submitProfilePictureChange(): Promise<void> {
        if (await this.communication.editProfilePicture(this.profile.loginInfo as LoginInfo, this.image).toPromise())
            this.responseMessage = this.text('successfulProfilePictureChange');
        else this.responseMessage = this.text('serverError');
    }
}
