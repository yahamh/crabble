import { Component } from '@angular/core';
import { UITextUtil } from '@app/services/ui-text-util';

@Component({
    selector: 'app-profile-edition-page',
    templateUrl: './profile-edition-page.component.html',
    styleUrls: ['./profile-edition-page.component.scss'],
})
export class ProfileEditionPageComponent {

    text(key: string): string {
        return UITextUtil.getText(key);
    }

}
