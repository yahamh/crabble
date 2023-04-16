import { SafeHtml } from '@angular/platform-browser';

export interface ChatMessage {
    type?: string;
    sender?: string;
    avatarId?: string;
    timestamp?: number;
    formattedMessage?: SafeHtml
    message: string;
}
