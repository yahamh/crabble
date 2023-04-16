import { Injectable } from '@angular/core';
import { AccountCreationInfo } from '@app/socket-handler/interfaces/account-creation-info.interface';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { FriendRequest } from '../interfaces/friend-request.interface';

@Injectable({
    providedIn: 'root',
})
export class NotificationService {
    socket: Socket;
    accountData: AccountCreationInfo;
    chatIsActive: boolean;

    username: string | null;

    friendRequestSubject = new Subject<any>();
    get friendRequest$(): Observable<any> {
        return this.friendRequestSubject;
    }

    constructor() {
        this.username = localStorage.getItem('username');
        this.join();
    }

    join() {
        this.socket = this.connectToSocket();
        setTimeout(() => {
            console.log(this.socket)
            this.socket.emit('friendsManagerSocketJoin', this.username);
        }, 100);

        this.socket.on('newFriendRequest', (content: FriendRequest) => {
            this.friendRequestSubject.next({ action: "newFriendRequest" });
        });

        this.socket.on('deleteFriend', (userName: String) => {
            this.friendRequestSubject.next({ action: "delete", friendToBeDeleted: userName });
        });

        this.socket.on('friendRequestAccepted', (userName: String) => {
            this.friendRequestSubject.next({ action: "add", friendToBeAdded: userName });
        });

        this.socket.on('newMessageRequest', (userName: String) => {
            this.friendRequestSubject.next({ action: "newMessage" });
        });
    }

    private connectToSocket() {
        return io(environment.serverSocketUrl, { path: '/socketNotifications' });
    }

}
