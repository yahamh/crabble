import { AfterContentChecked, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAX_NAME_LENGTH, MIN_NAME_LENGTH } from '@app/game-logic/constants';
import { Conversation } from '@app/interfaces/conversation.interface';
import { ConversationService } from '@app/services/conversation.service';
import { UITextUtil } from '@app/services/ui-text-util';
import { NewSoloGameFormComponent } from '../new-solo-game-form/new-solo-game-form.component';

@Component({
    selector: 'app-join-chatroom-form',
    templateUrl: './join-chatroom-form.component.html',
    styleUrls: ['./join-chatroom-form.component.scss'],
})
export class JoinChatroomFormComponent implements AfterContentChecked {
    chatRooms: Conversation[] = [];
    term: string = '';
    chatRoomName: string = '';
    selectedValue: Conversation[] = [];
    nameExistsError: string = '';
    noChatroomMessage: string = '';
    joinedConversations: Conversation[] = [];

    chatRoomCreationForm = new FormGroup({
        chatRoomName: new FormControl('', [Validators.required, Validators.minLength(MIN_NAME_LENGTH), Validators.maxLength(MAX_NAME_LENGTH)]),
    });

    ngAfterContentChecked() {
        this.cdref.detectChanges();
    }

    constructor(
        private dialogRef: MatDialogRef<NewSoloGameFormComponent>,
        private conversationService: ConversationService,
        private cdref: ChangeDetectorRef,
        private _snackBar: MatSnackBar,
    ) {}

    text(key: string): string {
        return UITextUtil.getText(key);
    }

    ngOnInit(): void {
        this.loadData();
    }

    cancel(): void {
        this.closeDialog('');
    }

    closeDialog(roomName: string): void {
        this.dialogRef.close(roomName);
    }

    // This fun is called when the user click on the join button and create chatroom
    joinRoom(room: Conversation[]) {
        this.conversationService.getConversationList().subscribe((response) => {
            this.joinedConversations = response;
            // check if the user is already in the chatroom
            if (this.joinedConversations.find((conversation) => conversation.roomId === room[0].roomId)) {
                this._snackBar.open(this.text('youAreAlreadyInChatroom'), '', {
                    duration: 1500,
                    verticalPosition: 'top',
                });
            } else {
                this.conversationService.connectToConversation(room[0].roomId);
                this.conversationService.addToConversationsList(this.conversationService.loginInfo.username, room[0].roomId);
                this.closeDialog(room[0].name);
            }
        });
    }

    loadData() {
        this.chatRooms = [];
        this.conversationService.getChatRoomConversationList().subscribe((response) => {
            this.chatRooms = response;
            if (this.chatRooms.length === 0) {
                this.noChatroomMessage = this.text('noChatroomAvailable');
            } else {
                this.noChatroomMessage = '';
            }
        });
    }

    refreshData() {
        this.loadData();
    }

    createChatRoom() {
        const roomName = this.chatRoomCreationForm.value.chatRoomName as string;
        this.conversationService.checkChatRoomName(roomName).then(async (exist) => {
            if (exist) {
                this.nameExistsError = this.text('chatroomNameAlreadyUsed');
            } else {
                this.nameExistsError = '';
                await this.conversationService.createChatroom(roomName, 'chatRoom');
                this._snackBar.open(this.text('chatroomCreated'), '', {
                    duration: 1500,
                    verticalPosition: 'top',
                });
                this.closeDialog(roomName);
            }
        });
    }

    get formValid(): boolean {
        return this.chatRoomCreationForm.valid;
    }

    // check if the current user is the owner of the chatroom
    canEdit(chatroom: Conversation): boolean {
        if (chatroom.owner === this.conversationService.loginInfo.username) {
            return true;
        } else {
            return false;
        }
    }

    onDeleteChatRoom(chatroom: Conversation) {
        try {
            this.conversationService.leaveConversation(chatroom.roomId);
            this.conversationService.makeLeaveChatRoom(chatroom.roomId);
            this.conversationService.deleteChatRoom(chatroom);
            // make every socket leave the chatroom
            this._snackBar.open(this.text('chatroomDeleted'), '', {
                duration: 1500,
                verticalPosition: 'top',
            });
            this.chatRooms.splice(this.chatRooms.indexOf(chatroom), 1);
        } catch (error) {
            this._snackBar.open(this.text('chatroomDeletionError'), '', {
                duration: 1500,
                verticalPosition: 'top',
            });
        }
    }
}
