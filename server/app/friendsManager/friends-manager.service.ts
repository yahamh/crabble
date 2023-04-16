import { DB_COLLECTION_FRIENDREQUESTS } from '@app/constants/constants';
import { DatabaseService } from '@app/database/database.service';
import { FriendRequest } from '@app/interfaces/friend-request.interface';
import { FriendInfo } from '@app/login/interfaces/friend-info.inteface';
import { LoginService } from '@app/login/login.service';
import { NotificationService } from '@app/notification-service/notification.service';
import { Collection } from 'mongodb';
import { Service } from 'typedi';

@Service()
export class FriendsManagerService {
    friendsList: FriendInfo[] = [];
    constructor(private databaseService: DatabaseService, private loginService: LoginService, private notificationService: NotificationService) {}

    get collectionFriendRequests(): Collection<FriendRequest> {
        return this.databaseService.database.collection(DB_COLLECTION_FRIENDREQUESTS);
    }

    async sendFriendRequest(friendRequest: FriendRequest) {
        this.notificationService.notifyFriendRequest(friendRequest.receiver ?? '', friendRequest);
        let receiverId = (await this.loginService.getIdByUsername(friendRequest.receiver ?? '')).toString();
        let senderId = (await this.loginService.getIdByUsername(friendRequest.sender ?? '')).toString();
        friendRequest.receiver = receiverId;
        friendRequest.sender = senderId;
        await this.collectionFriendRequests.replaceOne({ sender: senderId, receiver: receiverId }, friendRequest, { upsert: true });
    }

    async updateFriendRequest(friendRequest: FriendRequest) {
        let receiverId = (await this.loginService.getIdByUsername(friendRequest.receiver ?? '')).toString();
        let senderId = (await this.loginService.getIdByUsername(friendRequest.sender ?? '')).toString();
        friendRequest.receiver = receiverId;
        friendRequest.sender = senderId;
        await this.collectionFriendRequests.updateOne({ sender: senderId, receiver: receiverId }, { $set: { status: friendRequest.status } });
    }

    async getFriendRequests(receiver: string): Promise<any> {
        let friendRequests: FriendRequest[] = [];
        let receiverId = (await this.loginService.getIdByUsername(receiver)).toString();
        friendRequests = await this.collectionFriendRequests.find({ receiver: receiverId, status: 'pending' }).toArray();
        // change senderid in each friend request to username
        for (let i = 0; i < friendRequests.length; i++) {
            friendRequests[i].sender = await this.loginService.getUsernameById(friendRequests[i].sender ?? '');
        }
        return friendRequests;
    }

    async getFriendsList(user: string): Promise<FriendInfo[]> {
        this.friendsList = [];
        await this.loginService.getCollectionFriendsList(user).then((friends) => {
            this.friendsList = friends;
        });
        return this.friendsList;
    }

    async updateFriendsList(user: string, friend: string, action: string) {
        user = (await this.loginService.getIdByUsername(user)).toString();
        friend = (await this.loginService.getIdByUsername(friend)).toString();
        await this.loginService.updateFriendsList(user, friend, action);
    }

    // check if user exists on database
    async checkUserExist(username: string) {
        const rep = await this.loginService.checkUserExist(username);
        return rep;
    }

    //check on database if the friend request has already been sent by the sender to the receiver
    async checkFriendRequestExist(sender: string, receiver: string, status: string) {
        let senderId = (await this.loginService.getIdByUsername(sender)).toString();
        let receiverId = (await this.loginService.getIdByUsername(receiver)).toString();
        if (await this.collectionFriendRequests.find({ sender: senderId, receiver: receiverId, status: status }).count() != 0) {
            return true;
        } else if (await this.collectionFriendRequests.find({ sender: receiverId, receiver: senderId, status: status }).count() != 0) {
            return true;
        } else {
            return false;
        }
    }
}
