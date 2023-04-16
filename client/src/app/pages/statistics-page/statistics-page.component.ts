import { ChangeDetectorRef, Component } from '@angular/core';
import { ElectronService } from '@app/services/electron.service';
import { UITextUtil } from '@app/services/ui-text-util';

@Component({
    selector: 'app-statistics-page',
    templateUrl: './statistics-page.component.html',
    styleUrls: ['./statistics-page.component.scss'],
})
export class StatisticsPageComponent {
    isChatDocked = true;

    constructor(private electron: ElectronService, private changeDetectorRef: ChangeDetectorRef) {
        this.isChatDocked = this.electron.isChatDocked;
        this.electron.chatVisibilityChanged$.subscribe((value) => {
            this.isChatDocked = value;
            this.changeDetectorRef.detectChanges();
        });
    }

    text(key: string): string {
        return UITextUtil.getText(key);
    }
}
