import { HTTP_STATUS_CREATED, HTTP_STATUS_OK } from '@app/constants/constants';
import { FriendsManagerService } from '@app/friendsManager/friends-manager.service';
import { FriendRequest } from '@app/interfaces/friend-request.interface';
import { NotificationService } from '@app/notification-service/notification.service';
import { Request, Response, Router } from 'express';
import { Service } from 'typedi';

// const HTTP_STATUS_ACCEPTED = 202;
// const HTTP_STATUS = 203;

@Service()
export class FriendsManagerController {
    router: Router;
    friendRequest: FriendRequest;

    constructor(private readonly friendsManagerService: FriendsManagerService, private notificationService: NotificationService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/sendFriendRequest', async (req: Request, res: Response) => {
            const friendRequest: FriendRequest = req.body;
            this.notificationService.notifyFriendRequest(friendRequest.receiver ?? '', friendRequest);
            await this.friendsManagerService.sendFriendRequest(friendRequest).then(() =>
                res.sendStatus(HTTP_STATUS_CREATED));
        });

        this.router.get('/getFriendRequests', async (req: Request, res: Response) => {
            const receiver = req.query.username as string;
            await this.friendsManagerService.getFriendRequests(receiver).then((friendRequest) =>
                res.status(HTTP_STATUS_OK).send(friendRequest));
        });

        this.router.post('/updateFriendRequest', async (req: Request, res: Response) => {
            const friendRequest: FriendRequest = req.body;
            await this.friendsManagerService.updateFriendRequest(friendRequest).then(() =>
                res.sendStatus(HTTP_STATUS_CREATED));
        });

        this.router.get('/getFriendsList', async (req: Request, res: Response) => {
            const user = req.query.username as string;
            this.friendsManagerService.getFriendsList(user).then((friendList) =>
                res.status(HTTP_STATUS_OK).send(friendList));
        });

        //update friend list form communication service
        this.router.post('/updateFriendsList', async (req: Request, res: Response) => {
            const friend = req.body.friend;
            const user = req.body.user;
            const action = req.body.action;
            await this.friendsManagerService.updateFriendsList(user, friend, action);
            await this.friendsManagerService.updateFriendsList(friend, user, action);
            if (req.body.action == 'add') {
                this.notificationService.notifyFriendRequestAccepted(friend, user);
            } else if (req.body.action == 'remove') {
                this.notificationService.deleteFriendNotification(friend, user);
            }

            res.sendStatus(HTTP_STATUS_CREATED);
        });

        //check if user exists on database
        this.router.get('/checkUsernameExist', async (req: Request, res: Response) => {
            const username = req.query.username as string;
            this.friendsManagerService.checkUserExist(username).then((exist) =>
                res.status(HTTP_STATUS_OK).send(exist));
        });

        //check on database if the friend request has already been sent by the sender to the receiver
        this.router.post('/checkFriendRequestExist', async (req: Request, res: Response) => {
            const sender = req.body.sender as string;
            const receiver = req.body.receiver as string;
            const status = req.body.status as string;
            this.friendsManagerService.checkFriendRequestExist(sender, receiver, status).then((exist) =>
                res.status(HTTP_STATUS_OK).send(exist));
        }
        );

    }
}
