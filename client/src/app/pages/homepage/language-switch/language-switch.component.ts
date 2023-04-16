import { Component } from '@angular/core';
import { PreferenceService } from '@app/services/preference.service';
import { UITextUtil } from '@app/services/ui-text-util';
import { UserProfileService } from '@app/services/user-profile.service';

@Component({
    selector: 'app-language-switch',
    templateUrl: './language-switch.component.html',
    styleUrls: ['./language-switch.component.scss'],
})
export class LanguageSwitchComponent {
    constructor(private preference: PreferenceService, private profile: UserProfileService) {}

    text(key: string): string {
        return UITextUtil.getText(key);
    }

    selectLanguage(language: string): void {
        this.preference.setUsesFrench(this.profile.loginInfo?.username ?? '', language == 'fr')
    }
}
