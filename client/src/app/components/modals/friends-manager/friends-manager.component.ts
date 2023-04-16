import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAX_NAME_LENGTH, MIN_NAME_LENGTH } from '@app/game-logic/constants';
import { ConversationService } from '@app/services/conversation.service';
import { FriendsManagerService } from '@app/services/friends-manager.service';
import { UITextUtil } from '@app/services/ui-text-util';
import { FriendRequest } from '@app/socket-handler/interfaces/friend-request.interface';
import { NotificationService } from '@app/socket-handler/notification-service/notification-service';
import { Subscription } from 'rxjs';
import { NewSoloGameFormComponent } from '../new-solo-game-form/new-solo-game-form.component';
import { FriendInfo } from './friend-info.interface';

@Component({
    selector: 'friends-manager',
    templateUrl: './friends-manager.component.html',
    styleUrls: ['./friends-manager.component.scss'],
})
export class FriendsManagerComponent implements OnInit, OnDestroy {
    private notificationSubscription: Subscription;

    userNotFoundError: string = '';
    friendRequests: FriendRequest[] = [];
    friendsList: FriendInfo[] = [];
    friend: FriendInfo;
    noFriendsMessage: string = '';
    noFriendRequestMessage: string = '';

    selectedValue: string = '';
    requestAlreadySent: boolean = false;
    friendRequest: FriendRequest;
    newFriendRequest: boolean = false;

    constructor(
        private dialogRef: MatDialogRef<NewSoloGameFormComponent>,
        private friendsManagerService: FriendsManagerService,
        private _snackBar: MatSnackBar,
        private notificationService: NotificationService,
        private conversationService: ConversationService,
    ) {}

    ngOnInit(): void {
        this.getFriendRequests();
        this.getFriendsList();
        this.notificationSubscription = this.notificationService.friendRequest$.subscribe(async (content) => {
            switch (content.action) {
                case 'newFriendRequest':
                    this.newFriendRequest = true;
                    this.getFriendRequests();
                    break;
                case 'delete':
                    this.getFriendsList();
                    break;
                case 'add':
                    this.getFriendsList();
                    break;
            }
        });
    }

    text(key: string): string {
        return UITextUtil.getText(key);
    }

    ngOnDestroy() {
        this.notificationSubscription.unsubscribe();
    }

    addFriendForm = new FormGroup({
        userName: new FormControl('', [Validators.required, Validators.minLength(MIN_NAME_LENGTH), Validators.maxLength(MAX_NAME_LENGTH)]),
    });

    get formValid(): boolean {
        return this.addFriendForm.valid;
    }

    closeDialog(conversationName: string): void {
        this.dialogRef.close(conversationName);
    }

    createFriendRequest() {
        const sendTo = this.addFriendForm.value.userName;
        // check on the database if the user exist
        this.friendsManagerService.checkFriendRequestAlreadySent(sendTo).then((response) => {
            if (!this.isSelf(sendTo) && !this.isFriend(sendTo) && !response) {
                this.friendsManagerService.checkUserExist(sendTo).then((response) => {
                    if (response) {
                        this.friendsManagerService.sendFriendRequest(sendTo);
                        this.userNotFoundError = '';
                        this.addFriendForm.reset();
                        this._snackBar.open(this.text('requestSent'), '', {
                            duration: 1500,
                            verticalPosition: 'top',
                        });
                    } else {
                        this.userNotFoundError = this.text('userNotFound');
                    }
                });
            } else {
                this.userNotFoundError = this.text('friendRequestError');
            }
        });
    }

    // check if the user is already in the friend list
    isFriend(name: string): boolean {
        // check if the two users are already friends
        for (let i = 0; i < this.friendsList.length; i++) {
            if (this.friendsList[i].username === name) {
                return true;
            }
        }
        return false;
    }

    //check if the user to add is not self
    isSelf(name: string) {
        return name === this.friendsManagerService.getUserName();
    }

    //check on database if teh friend request has already been sent by the sender to the receiver
    async friendRequestAlreadySent(receiver: string) {
        return this.friendsManagerService.checkFriendRequestAlreadySent(receiver).then((response) => {
            this.requestAlreadySent = response;
        });
    }

    getFriendsList() {
        this.friendsList = [];
        this.friendsManagerService.getfriendsList().subscribe((response) => {
            if (response) {
                this.friendsList = response;
            }
            if (this.friendsList.length === 0) {
                this.noFriendsMessage = this.text('noFriends');
            } else {
                this.noFriendsMessage = '';
            }
        });
    }

    async getFriendRequests() {
        await this.friendsManagerService.getFriendRequests().subscribe((response) => {
            this.friendRequests = response;
            if (this.friendRequests.length > 0) {
                this.newFriendRequest = true;
                this.noFriendRequestMessage = '';
            } else {
                this.noFriendRequestMessage = this.text('noPendingFriendRequest');
            }
        });
    }

    async onAccept(requestorName?: string) {
        if (requestorName) {
            //accept the friend request
            this.friendsManagerService.updateFriendRequest('accepted', requestorName);
            this.removeFriendRequestFromList(requestorName);
            await this.addFriend(requestorName);
            this.getFriendsList();
        }
    }

    removeFriendRequestFromList(name?: string) {
        //remove the friend request from the list
        this.friendRequests.forEach((request, index) => {
            if (request.sender === name) {
                this.friendRequests.splice(index, 1);
            }
        });
        // check if the friend request list is empty
        if (this.friendRequests.length === 0) {
            this.newFriendRequest = false;
        }
    }

    onDecline(requestorName?: string) {
        if (requestorName) {
            //accept the friend request
            this.friendsManagerService.updateFriendRequest('declined', requestorName);
            //remove the friend request from the list
            this.removeFriendRequestFromList(requestorName);
        }
    }

    async onRemoveFriend(friend: FriendInfo) {
        await this.updateFriendList(friend.username, 'remove');
        if (friend.conversationId !== null) {
            this.conversationService.deleteConversation(friend.conversationId ?? '');
        }
        this.getFriendsList();
    }

    async addFriend(friendName: string) {
        // add the friend to the list if not already in the list
        if (!this.isFriend(friendName)) {
            await this.updateFriendList(friendName, 'add');
        }
    }

    async updateFriendList(friend: string, action: string) {
        await this.friendsManagerService.updateFriendList(friend, action);
    }

    async onSendMessage(friendUserId: string) {
        // check if the conversation already exist
        await this.conversationService.checkConversationExist(friendUserId).then(async (response) => {
            if (response) {
                // if the conversation already exist, send error message
                this._snackBar.open(this.text('theConversationAlreadyExists'), '', {
                    duration: 1500,
                    verticalPosition: 'top',
                });
            } else {
                // if the conversation doesn't exist, create it
                await this.conversationService.createConversation(friendUserId, 'private');
                this.conversationService.connectToConversation(friendUserId);
                this.conversationService.reloadData.next();
                this.closeDialog(friendUserId);
            }
        });
    }
}
