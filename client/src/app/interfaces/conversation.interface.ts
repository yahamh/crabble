import { ChatMessage } from './chat-message';

export interface Conversation {
    name: string;
    roomId: string;
    message?: ChatMessage[];
    owner?: string;
    receiver?: string;
    // "private" or "chatRoom"
    type?: string;
    participants: string[];
}
