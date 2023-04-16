import { ChangeDetectorRef, Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AccountCreationFormComponent } from '@app/components/modals/account-creation-form/account-creation-form.component';
import { LoginFormComponent } from '@app/components/modals/login-form/login-form.component';
import { ElectronService } from '@app/services/electron.service';
import { UITextUtil } from '@app/services/ui-text-util';
import { UserProfileService } from '@app/services/user-profile.service';

@Component({
    selector: 'app-user-profile-page',
    templateUrl: './user-profile-page.component.html',
    styleUrls: ['./user-profile-page.component.scss'],
})
export class UserProfilePageComponent {
    isChatDocked:boolean = true;
    
    constructor(
        private userProfile: UserProfileService,
        private dialog: MatDialog,
        private router: Router,
        private electron: ElectronService,
        private changeDetectorRef: ChangeDetectorRef 
    ) {
        this.isChatDocked = this.electron.isChatDocked;
        this.electron.chatVisibilityChanged$.subscribe(value => {
            this.isChatDocked = value;
            this.changeDetectorRef.detectChanges();
        })
    }

    text(key: string): string {
        return UITextUtil.getText(key);
    }

    isLoggedIn(): boolean {
        return this.userProfile.isLoggedIn();
    }

    openConnectForm(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        dialogConfig.disableClose = true;
        dialogConfig.minWidth = 60;

        this.dialog.open(LoginFormComponent, dialogConfig);
    }

    openCreateAccountForm(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        dialogConfig.disableClose = true;
        dialogConfig.minWidth = 60;

        this.dialog.open(AccountCreationFormComponent, dialogConfig);
    }

    disconnect(): void {
        this.userProfile.logOut();
        this.router.navigate(['/']);
    }
}
