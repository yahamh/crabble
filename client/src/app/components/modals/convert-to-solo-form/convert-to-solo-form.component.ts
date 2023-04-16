import { AfterContentChecked, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UITextUtil } from '@app/services/ui-text-util';

@Component({
    selector: 'app-convert-to-solo-form',
    templateUrl: './convert-to-solo-form.component.html',
    styleUrls: ['./convert-to-solo-form.component.scss'],
})
export class ConvertToSoloFormComponent implements AfterContentChecked {
    botDifficulty = new FormControl('', [Validators.required]);
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: string,
        private dialogRef: MatDialogRef<ConvertToSoloFormComponent>,
        private cdref: ChangeDetectorRef,
    ) {}

    text(key: string): string {
        return UITextUtil.getText(key);
    }
    ngAfterContentChecked() {
        this.cdref.detectChanges();
    }
    cancel(): void {
        this.dialogRef.close();
        this.botDifficulty.reset();
    }
    sendParameter(): void {
        this.dialogRef.close(this.botDifficulty.value);
    }
    get valid() {
        return this.botDifficulty.valid;
    }
}
