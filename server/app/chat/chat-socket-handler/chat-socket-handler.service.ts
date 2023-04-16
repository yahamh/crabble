import { AccountCreationInfo } from '@app/login/interfaces/account-creation-info.interface';
import { LoginInfo } from '@app/login/interfaces/login-info.interface';
import { LoginService } from '@app/login/login.service';
import { PasswordEncryption } from '@app/login/password-encryption';
import * as http from 'http';
import * as io from 'socket.io';
import { Service } from 'typedi';
import { ChatMessage } from '../chat-message.interface';
import { ConversationService } from '../conversation.service';

@Service()
export class ChatSocketHandler {
    readonly sio: io.Server;

    constructor(server: http.Server, private loginService: LoginService, private conversationService: ConversationService) {
        this.sio = new io.Server(server, {
            path: '/chat',
            cors: { origin: '*', methods: ['GET', 'POST'] },
        });
    }

    handleSockets() {
        this.sio.on('connection', (socket) => {
            let accountData: AccountCreationInfo | null = null;
            let currentChannel = 'Main chat';

            socket.join(currentChannel);

            socket.on('joinChat', async (content: LoginInfo) => {
                content.password = PasswordEncryption.encryptPassword(content.password)
                accountData = await this.loginService.getAccountData(content);
                if (accountData == null) {
                    socket.emit('connectionError');
                } else {
                    socket.emit('connectionSuccess', accountData);
                }
            });

            socket.on('joinConversation', (conversationId: string) => {
                socket.leave(currentChannel);
                socket.join(conversationId);
                currentChannel = conversationId;
            });

            socket.on('makeLeaveConversation', (conversationId: string) => {
                this.sio.to(conversationId).emit('conversationDeleted', conversationId);
                socket.leave(conversationId);
                this.sio.socketsLeave(conversationId);
            });

            socket.on('leaveConversation', (conversationId: string) => {
                socket.leave(conversationId);
            });

            socket.on('message', (content: ChatMessage, conversationId: string) => {
                this.conversationService.addMessageToConversation(content, conversationId);
                if (accountData != null) {
                    this.sio.to(currentChannel).emit('message', content);
                }
            });
        });
    }
}
