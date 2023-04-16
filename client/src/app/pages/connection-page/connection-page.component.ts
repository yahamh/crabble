import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UITextUtil } from '@app/services/ui-text-util';
import { UserProfileService } from '@app/services/user-profile.service';
import { AccountCreationInfo } from '@app/socket-handler/interfaces/account-creation-info.interface';
import { LoginInfo } from '@app/socket-handler/interfaces/login-info';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-connection-page',
    templateUrl: './connection-page.component.html',
    styleUrls: ['./connection-page.component.scss'],
})
export class ConnectionPageComponent implements OnInit {
    username: string = '';
    password: string = '';
    email: string = '';
    verifyPassword: string = '';

    image: string = '0';

    usernameLogin: string = '';
    passwordLogin: string = '';

    accountCreationError: string = '';

    devMode: string = '';

    serverReponseSubscription: Subscription | undefined;
    serverLoginSubscription: Subscription | undefined;

    constructor(private userProfileService: UserProfileService, private router: Router) {
        this.userProfileService.connectedSubject$.subscribe(() => {
            this.router.navigate(['/home']);
        });

        this.userProfileService.errorSocket$.subscribe(() => {
            this.accountCreationError = 'Erreur de connexion...';
            setTimeout(() => {
                this.accountCreationError = '';
            }, 2000);
        });
    }

    text(key: string): string {
        return UITextUtil.getText(key);
    }

    ngOnInit(): void {
        this.userProfileService.initConnection();
    }

    get validAccountInfos(): boolean {
        return (
            this.username.match(/^.{3,50}$/gm) != null &&
            this.password.match(/^.{3,50}$/gm) != null &&
            this.password == this.verifyPassword &&
            this.email.match(/^.+@.+\..+$/gm) != null
        );
    }

    get validLoginInfos(): boolean {
        return this.usernameLogin.match(/^.{3,50}$/gm) != null && this.passwordLogin.match(/^.{3,50}$/gm) != null;
    }

    createAccount() {
        if (this.serverReponseSubscription) return;

        const accountCreationInfo: AccountCreationInfo = {
            username: this.username,
            email: this.email,
            password: this.password,
            profilePictureId: this.image,
        };

        this.serverReponseSubscription = this.userProfileService.attemptToCreateAccount(accountCreationInfo).subscribe(
            async (response) => {
                if (response) {
                    await this.userProfileService.logIn({ username: accountCreationInfo.username, password: accountCreationInfo.password });
                } else {
                    this.accountCreationError = 'Erreur lors de la création de compte';
                    setTimeout(() => {
                        this.accountCreationError = '';
                    }, 2000);
                }
                this.serverReponseSubscription?.unsubscribe();
                this.serverReponseSubscription = undefined;
            },
            () => {
                this.accountCreationError = 'Erreur lors de la création de compte';
                setTimeout(() => {
                    this.accountCreationError = '';
                }, 2000);
                this.serverReponseSubscription?.unsubscribe();
                this.serverReponseSubscription = undefined;
            },
        );
    }

    async login() {
        const loginInfo: LoginInfo = { username: this.usernameLogin, password: this.passwordLogin };
        await this.userProfileService.logIn(loginInfo);
    }

    launchDevMode() {
        this.userProfileService.launchDevMode(this.devMode);
        this.router.navigate(['/home']);
    }
}
