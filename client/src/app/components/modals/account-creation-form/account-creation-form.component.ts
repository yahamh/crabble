import { AfterContentChecked, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NewSoloGameFormComponent } from '@app/components/modals/new-solo-game-form/new-solo-game-form.component';
import { ProfilePictureFormComponent } from '@app/components/modals/profile-picture-form/profile-picture-form.component';
import {
    MAX_EMAIL_LENGTH,
    MAX_NAME_LENGTH,
    MAX_PASSWORD_LENGTH,
    MIN_EMAIL_LENGTH,
    MIN_NAME_LENGTH,
    MIN_PASSWORD_LENGTH,
} from '@app/game-logic/constants';
import { ProfilePictureSelectorService } from '@app/services/profile-picture-selector.service';
import { UITextUtil } from '@app/services/ui-text-util';
import { UserProfileService } from '@app/services/user-profile.service';
import { AccountCreationInfo } from '@app/socket-handler/interfaces/account-creation-info.interface';
import { LoginInfo } from '@app/socket-handler/interfaces/login-info';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-account-creation-form',
    templateUrl: './account-creation-form.component.html',
    styleUrls: ['./account-creation-form.component.scss'],
})
export class AccountCreationFormComponent implements AfterContentChecked {
    accountCreationForm = new FormGroup({
        playerName: new FormControl('', [Validators.required, Validators.minLength(MIN_NAME_LENGTH), Validators.maxLength(MAX_NAME_LENGTH)]),
        email: new FormControl('', [
            Validators.required,
            Validators.email,
            Validators.minLength(MIN_EMAIL_LENGTH),
            Validators.maxLength(MAX_EMAIL_LENGTH),
        ]),
        password: new FormControl('', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH), Validators.maxLength(MAX_PASSWORD_LENGTH)]),
        passwordConfirmation: new FormControl('', [
            Validators.required,
            Validators.minLength(MIN_PASSWORD_LENGTH),
            Validators.maxLength(MAX_PASSWORD_LENGTH),
        ]),
    });

    accountCreationError = '';
    private serverReponseSubscription: Subscription;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: LoginInfo,
        private dialogRef: MatDialogRef<NewSoloGameFormComponent>,
        private cdref: ChangeDetectorRef,
        private userProfileService: UserProfileService,
        private dialog: MatDialog,
        private profilePictureSelector: ProfilePictureSelectorService,
    ) {}

    text(key: string): string {
        return UITextUtil.getText(key);
    }

    ngAfterContentChecked() {
        this.cdref.detectChanges();
    }

    createAccount() {
        if (this.serverReponseSubscription) return;

        const pictureId = this.profilePictureSelector.currentSelectionId;
        if (pictureId == null) return;

        const accountCreationInfo: AccountCreationInfo = {
            username: this.accountCreationForm.value.playerName,
            email: this.accountCreationForm.value.email,
            password: this.accountCreationForm.value.password,
            profilePictureId: pictureId.toString(),
        };

        this.serverReponseSubscription = this.userProfileService.attemptToCreateAccount(accountCreationInfo).subscribe(
            async (response) => {
                if (response) {
                    await this.userProfileService.logIn({ username: accountCreationInfo.username, password: accountCreationInfo.password });
                    this.closeDialog();
                } else {
                    this.accountCreationError = 'AccountCreationError';
                }
                this.serverReponseSubscription.unsubscribe();
            },
            () => {
                this.accountCreationError = 'AccountCreationError';
                this.serverReponseSubscription.unsubscribe();
            },
        );
    }

    cancel(): void {
        this.closeDialog();
    }

    closeDialog(): void {
        this.dialogRef.close();
        this.accountCreationForm.reset({
            playerName: '',
            email: '',
            password: '',
        });
        this.profilePictureSelector.currentSelectionId = null;
    }

    get formValid(): boolean {
        return this.accountCreationForm.valid && this.profilePictureSelector.currentSelectionId != null;
    }

    get loginInfo(): LoginInfo {
        return this.accountCreationForm.value;
    }

    openProfilePicturePicker(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        dialogConfig.disableClose = true;
        dialogConfig.minWidth = 60;

        this.dialog.open(ProfilePictureFormComponent, dialogConfig);
    }
}
