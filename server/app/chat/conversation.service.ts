import { DB_COLLECTION_CONVERSATIONS } from '@app/constants/constants';
import { DatabaseService } from '@app/database/database.service';
//import { LoginService } from '@app/login/login.service';
import { Collection } from 'mongodb';
import { Service } from 'typedi';
import { ChatMessage } from './chat-message.interface';
import { Conversation } from './conversation.interface';

@Service()
export class ConversationService {
    conversations: Conversation[];
    constructor(private databaseService: DatabaseService) {}

    get collectionConversation(): Collection<Conversation> {
        return this.databaseService.database.collection(DB_COLLECTION_CONVERSATIONS);
    }

    // get collectionChatroom(): Collection<Conversation> {
    //     return this.databaseService.database.collection(DB_COLLECTION_CHATROOMS);
    // }

    async getConversations(): Promise<Conversation[]> {
        return await this.collectionConversation.find({}).toArray();
    }

    async getChatRoomConversations(): Promise<Conversation[]> {
        return await this.collectionConversation.find({ type: 'chatRoom' }).toArray();
    }

    async getConversation(conversationId: String, type?: string): Promise<Conversation | null> {

        return await this.collectionConversation.findOne({ roomId: conversationId });

    }

    async addUserToChatRoom(username: string, conversationId: string) {
        await this.collectionConversation.findOneAndUpdate({
            roomId: conversationId
        }, { $push: { participants: username } });
    }

    removeUserFromChatRoom(username: string, conversationId: string) {
        this.collectionConversation.findOneAndUpdate({
            roomId: conversationId
        }, { $pull: { participants: username } });
    }

    async addConversation(conversation: Conversation) {
        if (conversation.type == "chatRoom") {
            try {
                await this.collectionConversation.insertOne(conversation);
            } catch (e) {
                return false;
            };
        } else {
            await this.collectionConversation.insertOne(conversation);
        }
        return true;
    }

    async addChatRoom(conversation: Conversation) {
        await this.collectionConversation.insertOne(conversation);
    }

    async deleteConversation(conversationId: String) {
        await this.collectionConversation.deleteOne({ roomId: conversationId });
    }

    async deleteChatRoom(conversationName: String) {
        await this.collectionConversation.deleteOne({ roomId: conversationName });
    }

    async checkChatRoomName(conversationName: String): Promise<boolean> {
        if (await this.collectionConversation.find({ name: conversationName }).count() != 0) {
            return true;
        } else {
            return false;
        }
    }

    async checkConversationExist(conversationId: String): Promise<boolean> {
        if (await this.collectionConversation.find({ name: conversationId }).count() != 0) {
            return true;
        } else {
            return false;
        }
    }

    // get messages of a chatroom
    async getMessages(conversationId: string): Promise<ChatMessage[]> {
        let conversation = await this.collectionConversation.findOne({ roomId: conversationId });
        return conversation?.messages || [];
    }

    async resetConversations(): Promise<void> {
        await this.collectionConversation.deleteMany({});
    }

    addMessageToConversation(message: ChatMessage, conversationId: string) {
        this.collectionConversation.findOneAndUpdate({
            roomId: conversationId
        }, { $push: { messages: message } });
    }

}
