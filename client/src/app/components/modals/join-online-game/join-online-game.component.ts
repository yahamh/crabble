import { AfterContentChecked, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ErrorDialogComponent } from '@app/components/modals/error-dialog/error-dialog.component';
import { WaitingRoomComponent } from '@app/components/modals/waiting-room/waiting-room.component';
import { MAX_NAME_LENGTH, MIN_NAME_LENGTH } from '@app/game-logic/constants';
import { UITextUtil } from '@app/services/ui-text-util';
import { OnlineGameSettings } from '@app/socket-handler/interfaces/game-settings-multi.interface';
import { NewOnlineGameSocketHandler } from '@app/socket-handler/new-online-game-socket-handler/new-online-game-socket-handler.service';
const NO_WHITE_SPACE_RGX = /^\S*$/;
@Component({
    selector: 'app-join-online-game',
    templateUrl: './join-online-game.component.html',
    styleUrls: ['./join-online-game.component.scss'],
})
export class JoinOnlineGameComponent implements AfterContentChecked, OnInit {
    oppName: FormControl;
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: OnlineGameSettings,
        private dialogRef: MatDialogRef<JoinOnlineGameComponent>,
        private dialog: MatDialog,
        private cdref: ChangeDetectorRef,
        private onlineSocketHandler: NewOnlineGameSocketHandler,
    ) {}

    text(key: string): string {
        return UITextUtil.getText(key);
    }

    ngOnInit() {
        this.oppName = new FormControl('', [
            Validators.required,
            Validators.minLength(MIN_NAME_LENGTH),
            Validators.maxLength(MAX_NAME_LENGTH),
            Validators.pattern(NO_WHITE_SPACE_RGX),
            this.forbiddenNameValidator(),
        ]);
    }

    ngAfterContentChecked() {
        this.cdref.detectChanges();
    }

    cancel(): void {
        this.dialogRef.close();
        this.oppName.reset();
    }

    sendParameter(): void {
        this.dialogRef.close(this.oppName.value);
        //this.onlineSocketHandler.joinPendingGame(this.data.id, this.oppName.value);
        this.onlineSocketHandler.error$.subscribe((error: string) => {
            if (error) {
                this.dialog.open(ErrorDialogComponent, { disableClose: true, autoFocus: true, data: error });
            }
        });
    }

    joinWaitingRoom(): void {
        //this.onlineSocketHandler.joinPendingGame(this.data.id, this.oppName.value);
        this.dialogRef.close(this.oppName.value);
        const joinWaitingRoomRef = new MatDialogConfig();
        joinWaitingRoomRef.autoFocus = true;
        joinWaitingRoomRef.disableClose = true;
        const joinWaitingRoom = this.dialog.open(WaitingRoomComponent, joinWaitingRoomRef);
        joinWaitingRoom.componentInstance.gameId = this.data.id;
        joinWaitingRoom.componentInstance.username = this.oppName.value;
        joinWaitingRoom.componentInstance.capacity = this.data.capacity;
        joinWaitingRoom.afterOpened().subscribe(() => {
            this.onlineSocketHandler.players$.subscribe((players) => {
                joinWaitingRoom.componentInstance.setPlayers(players);
            });

            this.onlineSocketHandler.isDisconnected$.subscribe((value) => {
                if (value) {
                    joinWaitingRoom.close(value);
                }
            });
        });
    }

    private forbiddenNameValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: unknown } | null =>
            !this.data.players.includes(control.value) ? null : { forbidden: control.value };
    }

    get valid() {
        return this.oppName.valid;
    }

    get randomBonusType() {
        return this.data.randomBonus ? this.text('isActivated') : this.text('isDeactivated');
    }
}
