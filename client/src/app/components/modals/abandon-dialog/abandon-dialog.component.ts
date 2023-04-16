import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GameManagerService } from '@app/game-logic/game/games/game-manager/game-manager.service';
import { UITextUtil } from '@app/services/ui-text-util';
@Component({
    selector: 'app-abandon-dialog',
    templateUrl: './abandon-dialog.component.html',
    styleUrls: ['./abandon-dialog.component.scss'],
})
export class AbandonDialogComponent {
    constructor(private dialogRef: MatDialogRef<AbandonDialogComponent>, private router: Router, private gameManager: GameManagerService) {}

    abandon() {
        this.gameManager.stopGame();
        this.router.navigate(['/home']);
        this.closeDialog();
    }

    text(key: string): string {
        return UITextUtil.getText(key);
    }

    closeDialog() {
        this.dialogRef.close();
    }
}
