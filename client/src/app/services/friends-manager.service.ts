import { Injectable } from '@angular/core';
import { FriendRequest } from '@app/socket-handler/interfaces/friend-request.interface';
import { LoginInfo } from '@app/socket-handler/interfaces/login-info';
import { Observable, Subject } from 'rxjs';
import { CommunicationService } from './communication.service';
import { UserProfileService } from './user-profile.service';

@Injectable({
    providedIn: 'root'
})
export class FriendsManagerService {
    friendsList: string[];
    friendRequest: FriendRequest = {
        sender: '',
        receiver: '',
        status: '',
    }
    friendRequests: FriendRequest[] = []
    newFriendRequest: boolean = false;

    notificationSubject = new Subject<boolean>();
    get notification$(): Observable<boolean> {
        return this.notificationSubject;
    }

    loginInfo: LoginInfo;
    constructor(private communicationService: CommunicationService, private userProfileService: UserProfileService) {
        if (this.userProfileService.loginInfromLocalStorage) {
            this.loginInfo = this.userProfileService.loginInfromLocalStorage;
        }

    }
    private userName = this.getUserName();

    getFriendRequests() {
        const user = this.userName;
        return this.communicationService.getFriendRequests(user);
    }

    getfriendsList() {
        const user = this.userName;
        return this.communicationService.getFriendsList(user);
    }

    // get username
    getUserName() {
        const user = localStorage.getItem('username');
        if (user) {
            return user;
        } else {
            return '';
        }
    }

    async updateFriendRequest(newStatus: string, sender?: string) {
        this.friendRequest.sender = sender;
        this.friendRequest.receiver = this.userName;
        this.friendRequest.status = newStatus;
        await this.communicationService.updateFriendRequest(this.friendRequest).toPromise();
        this.checkHasFriendRequest();
    }

    async sendFriendRequest(sendTo: string) {
        this.friendRequest.sender = this.userName;
        this.friendRequest.receiver = sendTo;
        this.friendRequest.status = "pending";
        await this.communicationService.sendFriendRequest(this.friendRequest).toPromise();
    }

    async updateFriendList(friend: string, action: string) {
        const user = this.userName;
        if (user) {
            await this.communicationService.updateFriendsList(user, friend, action).toPromise();
        };
    }

    // check if user exists on database
    async checkUserExist(username: string) {
        const rep = await this.communicationService.checkUserExist(username).toPromise();
        return rep;
    }

    //check on database if the friend request has already been sent by the sender to the receiver
    async checkFriendRequestAlreadySent(receiver: string) {
        const sender = this.userName;
        this.friendRequest.sender = sender;
        this.friendRequest.receiver = receiver;
        this.friendRequest.status = "pending";
        const rep = await this.communicationService.checkFriendRequestExist(this.friendRequest).toPromise();
        return rep;
    }

    // check if has friend request
    checkHasFriendRequest() {
        this.getFriendRequests().subscribe((friendRequests) => {
            this.friendRequests = friendRequests;
            if (this.friendRequests.length > 0) {
                this.newFriendRequest = true;
                this.notificationSubject.next(this.newFriendRequest);
            } else {
                this.newFriendRequest = false;
                this.notificationSubject.next(this.newFriendRequest);
            }
        });
    }
}
