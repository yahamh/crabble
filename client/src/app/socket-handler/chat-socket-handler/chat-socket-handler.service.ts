import { Injectable } from '@angular/core';
import { ChatMessage } from '@app/interfaces/chat-message';
import { UserProfileService } from '@app/services/user-profile.service';
import { AccountCreationInfo } from '@app/socket-handler/interfaces/account-creation-info.interface';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { LoginInfo } from '../interfaces/login-info';

@Injectable({
    providedIn: 'root',
})
export class ChatSocketHandlerService {
    socket: Socket;
    accountData: AccountCreationInfo;
    chatIsActive: boolean;

    private newMessageSubject = new Subject<ChatMessage>();
    get newMessageSubject$(): Subject<ChatMessage> {
        return this.newMessageSubject;
    }

    private chatRoomDeleted = new Subject<string>();
    get chatRoomDeleted$(): Subject<string> {
        return this.chatRoomDeleted;
    }

    loginInfo: LoginInfo;


    constructor(private userProfileService: UserProfileService) {
        if (this.userProfileService.loginInfromLocalStorage) {
            this.loginInfo = this.userProfileService.loginInfromLocalStorage;
            this.logIn();
        }
    }

    logIn() {
        if (!this.socket) {
            this.join();
        }

        this.connection();
    }

    connection() {
        if (this.loginInfo != null) {
            this.socket.emit('joinChat', this.loginInfo);
        }
    }

    reconnect() {
        if (this.socket && this.socket.connected) {
            this.loginInfo = this.userProfileService.loginInfromLocalStorage!;
            console.log(this.loginInfo)
            this.socket.disconnect();
            this.socket = undefined as any;
            this.join();
            this.connection();
        }
    }

    join() {
        if (this.socket) {
            throw new Error('Chat already joined.');
        }

        this.socket = this.connectToSocket();

        console.log(this.socket)

        this.socket.on('message', (message: ChatMessage) => {
            this.newMessageSubject.next(message);
        });

        this.socket.on('connectionSuccess', (content: AccountCreationInfo) => {
            this.accountData = content;
        });

        this.socket.on('connectionError', () => {
            console.log('error');
        });

        this.socket.on('conversationDeleted', (conversationId: string) => {
            this.chatIsActive = false;
            this.chatRoomDeleted.next(conversationId);
        });


    }

    sendMessage(message: string, conversationId: string) {
        if (!this.socket) {
            throw new Error('Chat not joined.');
        }
        console.log('sendMessage: ', message, conversationId);
        const chatMessage: ChatMessage = { message, sender: this.accountData.username, avatarId: this.accountData.profilePictureId, timestamp: Date.now() };
        this.socket.emit('message', chatMessage, conversationId);
    }

    joinConversation(conversationID: string) {
        this.socket.emit('joinConversation', conversationID);
    }

    makeLeaveConversation(conversationID: string) {
        this.socket.emit('makeLeaveConversation', conversationID);
    }

    private connectToSocket() {
        return io(environment.serverSocketUrl, { path: '/chat' });
    }

    getChatIsActive() {
        return this.chatIsActive;
    }

    leaveConversation(conversationName: string) {
        this.socket.emit('leaveConversation', conversationName);
    }

}
