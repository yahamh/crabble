import { Component, EventEmitter, Output } from '@angular/core';
import { UITextUtil } from '@app/services/ui-text-util';

@Component({
    selector: 'app-transform-tile',
    templateUrl: './transform-tile.component.html',
    styleUrls: ['./transform-tile.component.scss'],
})
export class TransformTileComponent {
    @Output() closed = new EventEmitter();

    constructor() {}

    text(key: string): string {
        return UITextUtil.getText(key);
    }

    close() {
        this.closed.emit();
    }
}
