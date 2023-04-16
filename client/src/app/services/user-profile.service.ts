import { Injectable } from '@angular/core';
import { AccountCreationInfo } from '@app/socket-handler/interfaces/account-creation-info.interface';
//import { FriendRequest } from '@app/socket-handler/interfaces/friend-request.interface';
import { LoginInfo } from '@app/socket-handler/interfaces/login-info';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { CommunicationService } from './communication.service';
import { PreferenceService } from './preference.service';

@Injectable({
    providedIn: 'root',
})
export class UserProfileService {
    private currentLoginInfo: LoginInfo | null;
    private connected: boolean = false;
    private socket: Socket;

    private connectedSubject = new Subject<undefined>();
    get connectedSubject$(): Subject<undefined> {
        return this.connectedSubject;
    }

    private errorSocketSubject = new Subject<undefined>();
    get errorSocket$(): Observable<undefined> {
        return this.errorSocketSubject;
    }

    constructor(private communicationService: CommunicationService, private preference: PreferenceService) {}

    async initConnection() {
        this.checkLocalStorage();
    }

    get loginInfromLocalStorage(): LoginInfo | null {
        const username = localStorage.getItem('username');
        const password = localStorage.getItem('password');
        if (username != null && password != null) {
            return { username, password };
        } else {
            return null;
        }
    }

    get loginInfo(): LoginInfo | null {
        return this.currentLoginInfo;
    }

    private async checkLocalStorage(): Promise<void> {
        const username = localStorage.getItem('username');
        const password = localStorage.getItem('password');
        if (username != null && password != null) {
            await this.logIn({ username, password });
        } else {
            this.connected = false;
        }
    }

    async logIn(loginInfo: LoginInfo): Promise<void> {
        if (this.socket && this.socket.connected) {
            this.socket.disconnect();
        }

        await this.connectSocket(loginInfo);
    }

    private async connectSocket(loginInfo: LoginInfo): Promise<void> {
        this.socket = io(environment.serverSocketUrl, { path: '/socketAccount' });

        this.socket.on('error', () => {
            this.socket.disconnect();
            this.connected = false;
            this.currentLoginInfo = null;
            this.errorSocketSubject.next();
        });

        this.socket.on('login', async (success) => {
            if (success) {
                localStorage.setItem('username', loginInfo.username);
                localStorage.setItem('password', loginInfo.password);
                this.currentLoginInfo = loginInfo;
                this.connected = true;
                this.connectedSubject.next();
                await this.preference.setPreferenceFromServer(loginInfo.username);
            } else {
                this.socket.disconnect();
                localStorage.removeItem('username');
                localStorage.removeItem('password');
                this.connected = false;
                this.currentLoginInfo = null;
                this.errorSocketSubject.next();
            }
        });

        this.socket.on('disconnect', () => {
            this.connected = false;
            this.currentLoginInfo = null;
            this.errorSocketSubject.next();
        });

        this.socket.emit('login', loginInfo);
    }

    editUsername(newName: string): void {
        (this.loginInfo as LoginInfo).username = newName;
        localStorage.setItem('username', newName);
    }

    logOut() {
        this.connected = false;
        localStorage.removeItem('username');
        localStorage.removeItem('password');
        this.socket?.disconnect();
    }

    clearLoginInfo(): void {
        this.connected = false;
        this.currentLoginInfo = null;
        localStorage.removeItem('username');
        localStorage.removeItem('password');
    }

    authentifyLoginInfo(loginInfo: LoginInfo): Observable<boolean> {
        return this.communicationService.login(loginInfo);
    }

    attemptToCreateAccount(accountCreationInfo: AccountCreationInfo): Observable<boolean> {
        return this.communicationService.createAccount(accountCreationInfo);
    }

    isLoggedIn(): boolean {
        return this.connected;
    }

    launchDevMode(username: string) {
        this.connected = true;
        this.currentLoginInfo = { username: username, password: '' };
        this.connectedSubject.next(undefined);
    }
}
