//import { Conversation } from "@app/chat/conversation.interface";
import { FriendInfo } from "./friend-info.inteface";

export interface AccountCreationInfo {
    username: string;
    email: string;
    password: string;
    profilePictureId: string;
    friendsList?: FriendInfo[];
    conversations: string[];
}
