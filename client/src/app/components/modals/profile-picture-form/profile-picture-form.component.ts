import { Component, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ProfilePictureData } from '@app/interfaces/profile-picture-data';
import { CommunicationService } from '@app/services/communication.service';
import { ProfilePictureSelectorService } from '@app/services/profile-picture-selector.service';
import { UITextUtil } from '@app/services/ui-text-util';
import { DEFAULT_PROFILE_PICTURE_DATA, IMAGE_FILE_EXTENSIONS } from 'src/constants/default-profile-picture.constants';

@Component({
    selector: 'app-profile-picture-form',
    templateUrl: './profile-picture-form.component.html',
    styleUrls: ['./profile-picture-form.component.scss'],
})
export class ProfilePictureFormComponent {
    @ViewChild('pictureUpload')
    pictureUpload: any;

    private currentlyPickedImageId: number | null;
    uploadedImageError: string;

    constructor(
        private picker: ProfilePictureSelectorService,
        private communication: CommunicationService,
        private dialogRef: MatDialogRef<ProfilePictureFormComponent>,
    ) {
        this.currentlyPickedImageId = null;
        this.uploadedImageError = '';
    }

    text(key: string): string {
        return UITextUtil.getText(key);
    }

    getDefaultImageDataArray(): ProfilePictureData[] {
        return DEFAULT_PROFILE_PICTURE_DATA;
    }

    getDefaultImage(index: number): string {
        const imageSource = DEFAULT_PROFILE_PICTURE_DATA[index].source;
        return imageSource != undefined ? imageSource : '';
    }

    pickDefaultImage(id: number): void {
        this.currentlyPickedImageId = id;
    }

    onFileChange(): void {
        const files = (this.pictureUpload as any).nativeElement.files as File[];
        if (files.length > 1) {
            this.uploadedImageError = this.text('moreThanOneFileError');
            return;
        }
        if (
            IMAGE_FILE_EXTENSIONS.findIndex((extension) => (files[0].name.split('.').pop() ? files[0].name.split('.').pop() == extension : false)) ==
            -1
        ) {
            this.uploadedImageError = this.text('chooseAnImageError');
            return;
        }
        const imageData = new FormData();
        imageData.append('profilePicture', files[0], files[0].name);

        const subscription = this.communication.uploadProfilePicture(imageData).subscribe(
            (result) => {
                this.currentlyPickedImageId = parseInt(result, 10);
                subscription.unsubscribe();
            },
            () => {
                this.uploadedImageError = this.text('serverError');
                subscription.unsubscribe();
            },
        );
    }

    hasPickedImage(): boolean {
        return this.currentlyPickedImageId != null;
    }

    isPictureSelected(index: number): boolean {
        return index == this.currentlyPickedImageId;
    }

    confirmSelection(): void {
        this.picker.currentSelectionId = this.currentlyPickedImageId;
        this.dialogRef.close();
    }

    cancel(): void {
        this.closeDialog();
    }

    closeDialog(): void {
        this.dialogRef.close();
    }
}
