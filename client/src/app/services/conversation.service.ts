import { Injectable } from '@angular/core';
import { ChatMessage } from '@app/interfaces/chat-message';
import { Conversation } from '@app/interfaces/conversation.interface';
import { ChatSocketHandlerService } from '@app/socket-handler/chat-socket-handler/chat-socket-handler.service';
import { LoginInfo } from '@app/socket-handler/interfaces/login-info';
import { ObjectId } from 'bson';
import { Observable, Subject } from 'rxjs';
import { CommunicationService } from './communication.service';
import { UserProfileService } from './user-profile.service';

@Injectable({
    providedIn: 'root',
})
export class ConversationService {

    loginInfo: LoginInfo;

    constructor(private communicationService: CommunicationService, private chatSockethandlerService: ChatSocketHandlerService, private userProfileService: UserProfileService) {
        if (this.userProfileService.loginInfromLocalStorage) {
            this.loginInfo = this.userProfileService.loginInfromLocalStorage;
        }
    }


    conversation: Conversation = {
        name: '',
        roomId: '',
        participants: [],
    };
    messages: ChatMessage[] = [];
    conversations: Conversation[] = [];
    currentConversationId: string = '';
    reloadData = new Subject<string>();
    get reloadData$(): Subject<string> {
        return this.reloadData;
    }

    getConversationList(): Observable<Conversation[]> {
        const user = localStorage.getItem('username');
        return this.communicationService.conversationGet(user ?? '');
    }

    getCurrentUser() {
        return localStorage.getItem('username') || '';
    }

    getChatRoomConversationList(): Observable<Conversation[]> {
        return this.communicationService.chatRoomConversationGet();
    }

    getMessages(conversationId: string) {
        return this.communicationService.conversationGetMessages(conversationId);
    }

    generateChatID() {
        const chatID = new ObjectId();
        return chatID;
    }



    async checkChatRoomName(conversationName: string) {
        const rep = await this.communicationService.checkChatRoomName(conversationName).toPromise();
        return rep.exist;
    }

    connectToConversation(conversationId: string) {
        this.currentConversationId = conversationId;
        this.reloadData.next(conversationId);

        this.chatSockethandlerService.joinConversation(conversationId);
    }

    getConversationId() {
        return this.currentConversationId;
    }

    async makeLeaveChatRoom(conversationName: string) {
        this.chatSockethandlerService.makeLeaveConversation(conversationName);
    }

    // Mettre a 0 la vue du chat
    resetChatView() {
        this.messages = [];
    }

    async createChatroom(conversationName: string, type: string) {
        this.conversation.name = conversationName;
        this.conversation.type = type;
        this.conversation.owner = this.loginInfo.username;
        this.conversation.roomId = this.generateChatID().toString();
        this.conversation.participants = [this.loginInfo.username];

        await this.communicationService.conversationCreateChatRoom(this.conversation).toPromise();
        this.addToConversationsList(this.loginInfo.username, this.conversation.roomId, 'chatRoom');

    }

    async createConversation(conversationName: string, type: string) {
        this.conversation.name = conversationName;
        this.conversation.type = type;
        this.conversation.owner = this.loginInfo.username;
        this.conversation.receiver = conversationName;
        this.conversation.roomId = this.generateChatID().toString();
        this.conversation.participants = [this.loginInfo.username, this.conversation.name];
        await this.communicationService.conversationCreate(this.conversation).toPromise();
        for (const participant of this.conversation.participants) {
            await this.addToConversationsList(participant, this.conversation.roomId, 'private');
        }
    }

    async deleteConversation(conversationId: string) {
        await this.communicationService.removeConversationFromAllUsers(conversationId, 'private').toPromise();
        await this.communicationService.conversationDelete(conversationId).toPromise();
    }

    // delete chatroom
    async deleteChatRoom(conversation: Conversation) {
        this.reloadData.next();
        await this.communicationService.conversationDeleteChatRoom(conversation).toPromise();
    }

    chatIsActive() {
        this.chatSockethandlerService.getChatIsActive();
    }

    async addToConversationsList(username: string, conversationName: string, type?: string) {
        await this.communicationService.conversationAddToConversationsList(username ?? '', conversationName, type ?? '').toPromise();
    }

    async leaveConversation(conversationName: string) {
        const user = localStorage.getItem('username');
        this.chatSockethandlerService.leaveConversation(conversationName);
        await this.communicationService.deleteConversationFromList(user ?? '', conversationName).toPromise();
    }

    async checkConversationExist(friend: string) {
        const rep = await this.communicationService.checkConversationExist(this.getCurrentUser(), friend).toPromise();
        return rep.exist;

    }



}
