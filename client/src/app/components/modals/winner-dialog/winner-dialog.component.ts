import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UITextUtil } from '@app/services/ui-text-util';

export interface WinnerDialogData {
    winnerNames: string[];
    isWinner: boolean;
}

@Component({
    templateUrl: './winner-dialog.component.html',
    styleUrls: ['./winner-dialog.component.scss'],
})
export class WinnerDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public winnerData: WinnerDialogData, private dialogRef: MatDialogRef<WinnerDialogComponent>) {}

    text(key: string): string {
        return UITextUtil.getText(key);
    }

    getWinnerMessage(): string {
        const winnerNames = this.winnerData.winnerNames;
        if (winnerNames.length !== 1) {
            return this.text('winnersAre') + winnerNames[0] + this.text('and') + winnerNames[1];
        }
        return this.text('winnerIs') + winnerNames[0];
    }

    getCongratulationMessage(): string {
        const userIsWinner = this.winnerData.isWinner;
        if (userIsWinner) {
            return this.text('congratulations');
        }
        return this.text('sorry');
    }

    close() {
        this.dialogRef.close();
    }
}
