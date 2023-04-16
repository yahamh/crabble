import { Component } from '@angular/core';
import { UITextUtil } from '@app/services/ui-text-util';

@Component({
    selector: 'app-disconnected-from-server',
    templateUrl: './disconnected-from-server.component.html',
    styleUrls: ['./disconnected-from-server.component.scss'],
})
export class DisconnectedFromServerComponent {
    constructor() {}

    text(key: string): string {
        return UITextUtil.getText(key);
    }
}
