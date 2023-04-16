import { Component, EventEmitter, Output } from '@angular/core';
import { UITextUtil } from '@app/services/ui-text-util';

@Component({
    selector: 'app-close-button',
    templateUrl: './close-button.component.html',
    styleUrls: ['./close-button.component.scss'],
})
export class CloseButtonComponent {
    @Output() closed = new EventEmitter();

    text(key: string): string {
        return UITextUtil.getText(key);
    }

    close() {
        this.closed.emit();
    }
}
