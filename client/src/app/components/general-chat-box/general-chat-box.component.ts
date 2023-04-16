import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ChatMessage } from '@app/interfaces/chat-message';
import { Conversation } from '@app/interfaces/conversation.interface';
import { ConversationService } from '@app/services/conversation.service';
import { ElectronService } from '@app/services/electron.service';
import { FriendsManagerService } from '@app/services/friends-manager.service';
import { UITextUtil } from '@app/services/ui-text-util';
import { ChatSocketHandlerService } from '@app/socket-handler/chat-socket-handler/chat-socket-handler.service';
import { NotificationService } from '@app/socket-handler/notification-service/notification-service';
import { Subscription } from 'rxjs';
import { DEFAULT_PROFILE_PICTURE_DATA } from 'src/constants/default-profile-picture.constants';
import { FriendsManagerComponent } from '../modals/friends-manager/friends-manager.component';
import { JoinChatroomFormComponent } from '../modals/join-chatroom-form/join-chatroom-form.component';

@Component({
    selector: 'app-general-chat-box',
    templateUrl: './general-chat-box.component.html',
    styleUrls: ['./general-chat-box.component.scss'],
})
export class GeneralChatBoxComponent implements OnInit {
    @ViewChild('messageContainer') private messageContainer: ElementRef;

    readonly profilePictures = DEFAULT_PROFILE_PICTURE_DATA;

    currentMessage: string = '';
    messages: ChatMessage[] = [];
    conversations: Conversation[] = [];
    selectedValue: string = '';
    chatSelected: boolean = false;
    currentUser: string = '';
    newFriendRequest: boolean = false;
    currentChatID: string = '';
    isLeftPanelShown = true;

    private reloadDataSubscription: Subscription;

    constructor(
        private dialog: MatDialog,
        private chatSocketHandlerService: ChatSocketHandlerService,
        private changeDetectorRef: ChangeDetectorRef,
        private conversationService: ConversationService,
        private electron: ElectronService,
        private _snackBar: MatSnackBar,
        private notificationService: NotificationService,
        private friendsManagerService: FriendsManagerService,
        private sanitizer: DomSanitizer,
    ) {}

    getSrcFromId(id: string): string {
        return this.profilePictures.find((v) => v.id.toString() == id)?.source ?? '0';
    }

    toggleLeftPanel() {
        this.isLeftPanelShown = !this.isLeftPanelShown;
    }

    text(key: string): string {
        return UITextUtil.getText(key);
    }

    toggleChatView(): void {
        this.electron.toggleChatDocking();
    }

    ngOnInit(): void {
        this.chatSocketHandlerService.reconnect();

        this.friendsManagerService.checkHasFriendRequest();
        this.chatSocketHandlerService.newMessageSubject$.subscribe((chatMessage) => {
            chatMessage.formattedMessage = this.getFormattedMessage(chatMessage.message);
            this.messages.push(chatMessage);
            this.changeDetectorRef.detectChanges();
            this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
        });

        this.reloadDataSubscription?.unsubscribe();
        this.reloadDataSubscription = this.conversationService.reloadData$.subscribe(async (conversationId) => {
            //load messages from conversation form conversationService
            this.messages = await this.conversationService.getMessages(conversationId).toPromise();
            if (this.messages) {
                this.messages.forEach((m) => (m.formattedMessage = this.getFormattedMessage(m.message)));
                this.changeDetectorRef.detectChanges();
                this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
            }
            this.loadData();
        });

        this.friendsManagerService.notification$.subscribe((content) => {
            this.newFriendRequest = content;
        });

        this.notificationService.friendRequest$.subscribe(async (content) => {
            switch (content.action) {
                case 'newFriendRequest':
                    this._snackBar.open(this.text('newFriendRequest'), '', {
                        duration: 2500,
                        verticalPosition: 'top',
                    });
                    this.newFriendRequest = true;
                    break;
            }
            this.loadData();
        });

        this.chatSocketHandlerService.chatRoomDeleted$.subscribe((value) => {
            //this.onLeaveChat(value);
            this.resetChatView();
            this.loadData();
            this._snackBar.open(this.text('theChatroom') + ' ' + value + ' ' + this.text('wasJustDeletedByItsOwner'), '', {
                duration: 2500,
                verticalPosition: 'top',
            });
        });
        this.currentUser = this.conversationService.getCurrentUser();
        this.loadData();
    }

    private escapeMessage(message: string): string {
        return message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    onKeyDown(e: KeyboardEvent): void {
        if (e.shiftKey && e.key === 'Enter') {
            this.onShiftEnter();
            e.preventDefault();
        } else if (e.key === 'Enter') {
            this.onEnter();
            e.preventDefault();
        }
    }

    onEnter(): void {
        if (this.currentMessage.trim() === '') {
            return;
        }
        this.currentChatID = this.conversationService.getConversationId();
        this.chatSocketHandlerService.sendMessage(this.escapeMessage(this.currentMessage), this.currentChatID);
        this.currentMessage = '';
    }

    onShiftEnter(): void {
        this.currentMessage += '\n';
    }

    async loadData() {
        this.conversations = await this.conversationService.getConversationList().toPromise();
    }

    connect(conversation: Conversation): void {
        this.resetChatView();
        this.conversationService.connectToConversation(conversation.roomId);
        this.chatSelected = true;
        this.toggleLeftPanel();
        if (conversation.type == 'chatRoom' || conversation.type == 'default') {
            this.selectedValue = '';
            this.selectedValue = conversation.name;
        } else {
            if (conversation.receiver == this.currentUser) {
                this.selectedValue = '';
                this.selectedValue = conversation.owner ?? '';
            } else {
                this.selectedValue = '';
                this.selectedValue = conversation.receiver ?? '';
            }
        }
    }

    // Mettre a 0 la vue du chat
    resetChatView() {
        this.messages = [];
    }

    getDateFormated(timestamp: number): string {
        return new Date(timestamp).toLocaleTimeString('it-IT');
    }

    openJoinChatRoomForm(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        dialogConfig.disableClose = true;
        dialogConfig.minWidth = 60;
        const dialogRef = this.dialog.open(JoinChatroomFormComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(async (roomName: string) => {
            if (roomName != '') {
                await this.loadData();
                this.resetChatView();
                this.chatSelected = true;
            }
        });
    }
    openFriendsManagerPanel(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        dialogConfig.disableClose = true;
        dialogConfig.minWidth = 60;
        const dialogRef = this.dialog.open(FriendsManagerComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(async () => {
            await this.loadData();
        });
    }

    stopPropagation(e: MouseEvent) {
        e.stopPropagation();
    }

    async clickOnLeaveChat(conversationName: string, e: MouseEvent) {
        await this.onLeaveChat(conversationName);
        e.stopPropagation();
    }

    async onLeaveChat(conversationName: string) {
        await this.conversationService.leaveConversation(conversationName);
        this.resetChat();
    }

    resetChat() {
        setTimeout(() => {
            this.chatSelected = false;
            this.loadData();
            this.selectedValue = '';
        }, 50);
    }

    getFormattedMessage(message: string): SafeHtml {
        message = message.replace(/\n/g, '<br />');

        message = this.replaceSymbolByHTMLTag(message, "<span class='text' style='font-weight:bold'>", '</span>', '**');
        message = this.replaceSymbolByHTMLTag(message, "<span class='text' style='font-style:italic'>", '</span>', '*');
        message = this.replaceSymbolByHTMLTag(message, "<span class='text' style='text-decoration:line-through'>", '</span>', '~~');
        message = this.replaceSymbolByHTMLTag(
            message,
            '<span class=\'text\' style=\'padding-left: 3px; padding-right: 3px; border-radius: 2px; background-color:#131314; cursor: pointer; color:rgba(0, 0, 0, 0); user-select: none; transition: background-color .1s ease-in-out;\' onMouseEnter=\'if(this.style.backgroundColor !== "rgb(86, 86, 92)") this.style.backgroundColor="#27272b";\' onMouseOut=\'if(this.style.backgroundColor !== "rgb(86, 86, 92)") this.style.backgroundColor="#131314";\' onClick=\'this.style.color="unset"; this.style.backgroundColor="#56565c"; this.style.userSelect="unset"; this.style.cursor="unset"\'>',
            '</span>',
            '||',
        );

        return this.sanitizer.bypassSecurityTrustHtml(message);
    }

    private replaceSymbolByHTMLTag(message: string, openingTag: string, closingTag: string, formattingSymbol: string): string {
        let closingSymbolIndex = 0;
        let openingSymbolIndex = 0;
        while (closingSymbolIndex != -1 && openingSymbolIndex != -1) {
            openingSymbolIndex = message.indexOf(formattingSymbol);
            if (openingSymbolIndex != -1) {
                closingSymbolIndex = message.indexOf(formattingSymbol, openingSymbolIndex + formattingSymbol.length);
            }
            if (closingSymbolIndex != -1 && openingSymbolIndex != -1) {
                message = this.replaceSymbolByTag(message, openingTag, closingTag, formattingSymbol);
            }
        }
        console.log(message);
        return message;
    }

    private replaceSymbolByTag(message: string, openingTag: string, closingTag: string, formattingSymbol: string): string {
        message = message.replace(formattingSymbol, openingTag);
        message = message.replace(formattingSymbol, closingTag);
        return message;
    }
}
