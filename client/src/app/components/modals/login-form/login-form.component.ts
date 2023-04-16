import { AfterContentChecked, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NewSoloGameFormComponent } from '@app/components/modals/new-solo-game-form/new-solo-game-form.component';
import { MAX_NAME_LENGTH, MAX_PASSWORD_LENGTH, MIN_NAME_LENGTH, MIN_PASSWORD_LENGTH } from '@app/game-logic/constants';
import { UITextUtil } from '@app/services/ui-text-util';
import { UserProfileService } from '@app/services/user-profile.service';
import { LoginInfo } from '@app/socket-handler/interfaces/login-info';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-login-form',
    templateUrl: './login-form.component.html',
    styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent implements AfterContentChecked {
    loginForm = new FormGroup({
        playerName: new FormControl('', [Validators.required, Validators.minLength(MIN_NAME_LENGTH), Validators.maxLength(MAX_NAME_LENGTH)]),
        password: new FormControl('', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH), Validators.maxLength(MAX_PASSWORD_LENGTH)]),
    });
    loginError: string;

    private serverLoginSubscription: Subscription;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: LoginInfo,
        private dialogRef: MatDialogRef<NewSoloGameFormComponent>,
        private cdref: ChangeDetectorRef,
        private userProfileService: UserProfileService,
    ) {}

    text(key: string): string {
        return UITextUtil.getText(key);
    }

    ngAfterContentChecked() {
        this.cdref.detectChanges();
    }

    connect() {
        if (this.serverLoginSubscription) return;
        const loginInfo: LoginInfo = { username: this.loginForm.value.playerName, password: this.loginForm.value.password };
        if (!this.serverLoginSubscription) {
            this.serverLoginSubscription = this.userProfileService.authentifyLoginInfo(loginInfo).subscribe(
                async (response) => {
                    if (response) {
                        await this.userProfileService.logIn(loginInfo);
                        this.closeAndReset();
                    } else {
                        this.loginError = this.text('connectionFailed');
                    }
                    this.serverLoginSubscription.unsubscribe();
                },
                () => {
                    this.loginError = this.text('connectionFailed');
                    this.serverLoginSubscription.unsubscribe();
                },
            );
        }
    }

    cancel(): void {
        this.closeAndReset();
    }

    private closeAndReset(): void {
        this.dialogRef.close();
        this.loginForm.reset({
            playerName: '',
            password: '',
        });
        this.loginError = '';
    }

    get formValid(): boolean {
        return this.loginForm.valid;
    }

    get loginInfo(): LoginInfo {
        return this.loginForm.value;
    }
}
