import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NOT_FOUND } from '@app/game-logic/constants';
import { openErrorDialog } from '@app/game-logic/utils';
import { DictInfo } from '@app/pages/admin-page/admin-dict/admin-dict.component';
import { DictHttpService } from '@app/services/dict-http.service';
import { UITextUtil } from '@app/services/ui-text-util';

@Component({
    selector: 'app-edit-dict',
    templateUrl: './edit-dict.component.html',
    styleUrls: ['./edit-dict.component.scss'],
})
export class EditDictDialogComponent {
    dictionary: DictInfo;
    tempDict: DictInfo;

    isEditedCorrectly = true;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: DictInfo,
        public dialogRef: MatDialogRef<EditDictDialogComponent>,
        private dictHttpService: DictHttpService,
        private dialog: MatDialog,
    ) {
        this.dictionary = { title: data.title, description: data.description, canEdit: data.canEdit };
        this.tempDict = { title: data.title, description: data.description, canEdit: data.canEdit };
    }

    text(key: string): string {
        return UITextUtil.getText(key);
    }

    uploadEdit(): void {
        if (this.tempDict.title.search('[^A-Za-z0-9 ]') !== NOT_FOUND) {
            this.openErrorModal(this.text('dictionaryTitleHasSpecialCharacters'));
            this.isEditedCorrectly = false;
            return;
        }
        this.dictHttpService.editDict(this.dictionary, this.tempDict).subscribe(
            (response) => {
                if (response) {
                    this.close();
                    return;
                }
                this.openErrorModal(this.text('dictionaryWithSameTitleExists') + '\n' + this.text('refreshToSeeUpdatedDictionaryList'));
                this.isEditedCorrectly = false;
            },
            (error: HttpErrorResponse) => {
                if (error.status === HttpStatusCode.NotFound) {
                    this.openErrorModal(this.text('editedDictionaryNotFound') + '\n' + this.text('refreshToSeeUpdatedDictionaryList'));
                    return;
                }
                this.openErrorModal(this.text('serverError'));
            },
        );
    }

    private close(): void {
        this.dialogRef.close(this.tempDict);
    }

    private openErrorModal(errorContent: string) {
        openErrorDialog(this.dialog, '400px', errorContent);
    }
}
