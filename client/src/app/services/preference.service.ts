import { Injectable } from '@angular/core';
import { Language } from '@app/enums/language';
import { CommunicationService } from './communication.service';
import { UITextUtil } from './ui-text-util';

@Injectable({
    providedIn: 'root',
})
export class PreferenceService {
    constructor(private communication: CommunicationService) {}

    async setPreferenceFromServer(username: string): Promise<void> {
        const preference = await this.communication.getPreference(username).toPromise();
        this.setLanguage(preference.usesFrench);
    }

    async setUsesFrench(username: string, usesFrench: boolean): Promise<void> {
        await this.communication.setPreference(username, usesFrench, true).toPromise();
        this.setLanguage(usesFrench);
    }

    async setUsesDarkMode(username: string, usesDarkMode: boolean): Promise<void> {
        await this.communication.setPreference(username, UITextUtil.language == Language.fr, usesDarkMode).toPromise();
        this.setDarkMode(usesDarkMode);
    }

    private setLanguage(usesFrench: boolean): void {
        UITextUtil.language = usesFrench ? Language.fr : Language.en;
    }

    private setDarkMode(usesDarkMode: boolean): void {
        return; //TODO
    }
}
