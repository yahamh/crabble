import { HTTP_STATUS_CREATED, HTTP_STATUS_OK } from '@app/constants/constants';
import { LoginService } from '@app/login/login.service';
import { NotificationService } from '@app/notification-service/notification.service';
import { Request, Response, Router } from 'express';
import { Service } from 'typedi';
import { Conversation } from './conversation.interface';
import { ConversationService } from './conversation.service';

const HTTP_STATUS_ACCEPTED = 202;
const HTTP_STATUS = 203;

@Service()
export class ConversationController {
    router: Router;

    constructor(private readonly conversationService: ConversationService, private readonly loginService: LoginService, private readonly notificationService: NotificationService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/addConversation', async (req: Request, res: Response) => {
            const conversation: Conversation = req.body;

            // replace all the participants of the chatroom by their ids with the getidbyusername function in login service
            const participants = conversation.participants;
            const participantsIds: string[] = [];
            for (const participant of participants) {
                const id = await this.loginService.getIdByUsername(participant);
                participantsIds.push(id.toString());
            }
            conversation.participants = participantsIds;

            // conversation name is the name of the first participantid plus the second participantid
            conversation.name = conversation.participants[0] + conversation.participants[1];
            await this.conversationService.addConversation(conversation).then(() => res.sendStatus(HTTP_STATUS_CREATED));
        });

        this.router.post('/checkChatRoomName', async (req: Request, res: Response) => {
            const conversationName = req.body.conversationName;
            let exists = await this.conversationService.checkChatRoomName(conversationName);
            res.status(200).send({ exist: exists });

        });

        this.router.get('/conversationGetMessages', async (req: Request, res: Response) => {
            const roomId = req.query.conversationId as string;
            return await this.conversationService.getMessages(roomId).then((messages) =>
                res.status(HTTP_STATUS_OK).send(messages));

        });


        this.router.post('/addChatRoom', async (req: Request, res: Response) => {
            const conversation: Conversation = req.body;
            await this.conversationService.addChatRoom(conversation).then(() => res.sendStatus(HTTP_STATUS_CREATED));
        });

        this.router.post('/addToConversationsList', async (req: Request, res: Response) => {
            // send notification of new message to user
            const userId = await this.loginService.getIdByUsername(req.body.user);

            this.conversationService.getConversation(req.body.conversationName, req.body.type).then(async (conversation) => {
                if (conversation) {
                    //await this.conversationService.addUserToChatRoom(userId.toString(), conversation.roomId ?? '');
                    await this.loginService.addConversationToUser(userId, conversation);
                    this.notificationService.notifyNewMessage(req.body.user);
                    res.sendStatus(HTTP_STATUS_CREATED);
                }
            });
        });

        this.router.post('/removeConversationFromAllUsers', async (req: Request, res: Response) => {
            req.body.conversationId.toString();

            this.conversationService.getConversation(req.body.conversationId.toString(), req.body.type).then((conversation) => {
                console.log(conversation);
                if (conversation) {
                    for (const user of conversation.participants) {
                        this.loginService.deleteConversationFromUser(user, req.body.conversationId.toString());
                    }
                    res.sendStatus(HTTP_STATUS_CREATED);
                }
            });
        });

        this.router.post('/deleteConversationFromList', async (req: Request, res: Response) => {
            const userId = await this.loginService.getIdByUsername(req.body.user);

            this.loginService.deleteConversationFromUser(userId.toString(), req.body.conversationName).then(() => res.sendStatus(HTTP_STATUS_CREATED));
            // remove user form conversation participants
            this.conversationService.getConversation(req.body.conversationName, req.body.type).then((conversation) => {
                if (conversation) {
                    this.conversationService.removeUserFromChatRoom(userId.toString(), conversation.roomId ?? '');
                }
            });
        });

        this.router.post('/deleteConversation', async (req: Request, res: Response) => {
            const conversationId: string = req.body.conversationId;
            console.log(conversationId);
            await this.conversationService.deleteConversation(conversationId).then(() => res.sendStatus(HTTP_STATUS_CREATED));
        });

        this.router.post('/deleteChatRoom', async (req: Request, res: Response) => {
            const chatRoom: Conversation = req.body.conversation;

            let conversation = await this.conversationService.getConversation(chatRoom.roomId ?? '', chatRoom.type ?? '');

            console.log(conversation);

            if (conversation) {
                for (const user of conversation.participants) {
                    await this.loginService.deleteConversationFromUser((await this.loginService.getIdByUsername(user)).toString(), conversation.roomId ?? '');
                }
            }

            await this.conversationService.deleteChatRoom(chatRoom.roomId ?? '');

            res.sendStatus(200);
        });

        this.router.get('/all', async (req: Request, res: Response) => {
            const user = req.query.username as string;
            await this.loginService.getConversations(user).then((conversation) =>
                res.status(HTTP_STATUS_OK).send(conversation));
        });

        this.router.get('/chatRoom', async (req: Request, res: Response) => {
            await this.conversationService.getChatRoomConversations().then((conversation) =>
                res.status(HTTP_STATUS_OK).send(conversation));
        });

        this.router.post('/checkConversationExist', async (req: Request, res: Response) => {
            const currentUsername = req.body.currentUsername as string;
            const friendUsername = req.body.friendUsername as string;
            let conversationId = (await this.loginService.getIdByUsername(currentUsername)) + (await this.loginService.getIdByUsername(friendUsername));
            let conversationId2 = (await this.loginService.getIdByUsername(friendUsername)) + (await this.loginService.getIdByUsername(currentUsername));
            if (await this.conversationService.checkConversationExist(conversationId)) {
                res.status(HTTP_STATUS_OK).send({ exist: true, conversationId: conversationId });
            } else if (await this.conversationService.checkConversationExist(conversationId2)) {
                res.status(HTTP_STATUS_OK).send({ exist: true, conversationId: conversationId2 });
            } else {
                res.status(HTTP_STATUS_OK).send({ exist: false });
            }
        });


        this.router.delete('/reset', async (req: Request, res: Response) => {
            await this.conversationService
                .resetConversations()
                .then(() => {
                    res.status(HTTP_STATUS_ACCEPTED).send();
                })
                .catch((error: Error) => {
                    res.status(HTTP_STATUS).send(error.message);
                });
        });
    }
}
