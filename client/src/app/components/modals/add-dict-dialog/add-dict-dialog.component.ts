import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NOT_FOUND } from '@app/game-logic/constants';
import { openErrorDialog } from '@app/game-logic/utils';
import { Dictionary } from '@app/game-logic/validator/dictionary';
import { DictHttpService } from '@app/services/dict-http.service';
import { UITextUtil } from '@app/services/ui-text-util';

@Component({
    selector: 'app-add-dict-dialog',
    templateUrl: './add-dict-dialog.component.html',
    styleUrls: ['./add-dict-dialog.component.scss'],
})
export class AddDictDialogComponent {
    @ViewChild('fileInput') inputRef: ElementRef;
    get input(): HTMLInputElement {
        return this.inputRef.nativeElement;
    }
    selectedFile = '';

    constructor(
        public dialogRef: MatDialogRef<AddDictDialogComponent>,
        private readonly dictHttpService: DictHttpService,
        private dialog: MatDialog,
    ) {}

    text(key: string): string {
        return UITextUtil.getText(key);
    }

    showSelectedFile() {
        const file = this.input.files;
        if (file === null) {
            return;
        }
        const fileName = file[0].name;
        if (!fileName.includes('.json')) {
            this.openErrorModal(this.text('selectedFileIsNotJSON'));
            return;
        }
        this.selectedFile = fileName;
    }

    async uploadFile() {
        if (this.input.files === null) {
            return;
        }
        const file = this.input.files[0];
        this.selectedFile = '';
        const dict = await this.readFile(file);
        this.uploadDictionary(dict);
    }

    private async readFile(file: File): Promise<Dictionary> {
        const tempFileReader = new FileReader();
        return new Promise((resolve) => {
            tempFileReader.onload = (response) => {
                if (response.target === null) {
                    return;
                }
                const resultString = response.target.result;
                if (resultString === null) {
                    return;
                }
                const dictionary: Dictionary = JSON.parse(resultString.toString());
                resolve(dictionary);
            };
            tempFileReader.readAsText(file);
        });
    }

    private async uploadDictionary(dict: Dictionary) {
        if (!dict.title || dict.title === null) {
            this.openErrorModal(this.text('dictionaryHasNoTitle'));
            return;
        }

        if (dict.title.search('[^A-Za-z0-9 ]') !== NOT_FOUND) {
            this.openErrorModal(this.text('dictionaryTitleHasSpecialCharacters'));
            return;
        }

        if (!dict.description || dict.description === null) {
            this.openErrorModal(this.text('dictionaryHasNoDescription'));
            return;
        }

        if (!dict.words || dict.words === null) {
            this.openErrorModal(this.text('dictionaryHasNoWordList'));
            return;
        }

        this.dictHttpService.uploadDict(dict).subscribe((value) => {
            if (value) {
                this.dialogRef.close();
            } else {
                this.openErrorModal(this.text('dictionaryWithSameTitleExists'));
            }
        });
    }

    private openErrorModal(errorContent: string) {
        openErrorDialog(this.dialog, '250px', errorContent);
    }
}
