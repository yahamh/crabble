import { ChatMessage } from "./chat-message.interface";

export interface Conversation {
    name: string;
    roomId?: string;
    messages?: ChatMessage[];
    owner?: string;
    receiver?: string;
    // "private" or "roomChat"
    type?: string;
    participants: string[];
}
