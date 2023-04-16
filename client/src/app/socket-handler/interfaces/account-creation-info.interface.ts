import { Conversation } from "@app/interfaces/conversation.interface";

export interface AccountCreationInfo {
    username: string;
    email: string;
    password: string;
    profilePictureId: string;
    friendsList?: string[];
    conversations?: Conversation[];
}
