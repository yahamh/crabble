import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NOT_ONLY_SPACE_RGX } from '@app/game-logic/constants';
import { openErrorDialog } from '@app/game-logic/utils';
import { BotHttpService, BotInfo } from '@app/services/bot-http.service';
import { UITextUtil } from '@app/services/ui-text-util';
@Component({
    selector: 'app-edit-bot-dialog',
    templateUrl: './edit-bot-dialog.component.html',
    styleUrls: ['./edit-bot-dialog.component.scss'],
})
export class EditBotDialogComponent {
    bot: BotInfo;
    editBotInfo: BotInfo;
    isEdit: boolean = false;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: BotInfo,
        private readonly botHttpService: BotHttpService,
        private dialog: MatDialog,
        private dialogRef: MatDialogRef<EditBotDialogComponent>,
    ) {
        this.bot = { name: data.name, type: data.type, canEdit: data.canEdit };
        this.editBotInfo = { name: data.name, type: data.type, canEdit: data.canEdit };
        this.isEdit = data.canEdit;
    }

    text(key: string): string {
        return UITextUtil.getText(key);
    }

    editBot() {
        this.botHttpService.editBot(this.editBotInfo, this.bot).subscribe(
            (response) => {
                const answer = JSON.parse(response.toString());
                if (!answer) {
                    this.openErrorModal(this.text('virtualPlayerNameAlreadyUsed'));
                } else this.dialogRef.close();
            },
            () => {
                this.openErrorModal(this.text('botNotFound'));
            },
        );
    }

    addBot() {
        this.botHttpService.addBot(this.bot).subscribe(
            (response) => {
                const answer = JSON.parse(response.toString());
                if (!answer) {
                    this.openErrorModal(this.text('virtualPlayerNameAlreadyUsed'));
                } else this.dialogRef.close();
            },
            () => {
                this.openErrorModal(this.text('serverError'));
            },
        );
    }

    private openErrorModal(errorContent: string) {
        openErrorDialog(this.dialog, '300px', errorContent);
    }

    get isValuesValid() {
        return this.bot.name && this.bot.type && NOT_ONLY_SPACE_RGX.test(this.bot.name);
    }
}
