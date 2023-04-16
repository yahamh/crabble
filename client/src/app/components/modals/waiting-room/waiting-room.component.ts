import { AfterContentChecked, ChangeDetectorRef, Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { NewOnlineGameSocketHandler } from '@app/socket-handler/new-online-game-socket-handler/new-online-game-socket-handler.service';

const SPINNER_WIDTH_STROKE = 7;
const SPINNER_DIAMETER = 40;
@Component({
    selector: 'app-waiting-room',
    templateUrl: './waiting-room.component.html',
    styleUrls: ['./waiting-room.component.scss'],
})
export class WaitingRoomComponent implements AfterContentChecked {
    spinnerStrokeWidth = SPINNER_WIDTH_STROKE;
    spinnerDiameter = SPINNER_DIAMETER;

    capacity = 4;
    players: string[] = [];
    username = '';
    gameId = '';

    constructor(
        private dialogRef: MatDialogRef<WaitingRoomComponent>,
        private cdref: ChangeDetectorRef,
        private onlineSocketHandler: NewOnlineGameSocketHandler,
    ) {}

    ngAfterContentChecked(): void {
        this.cdref.detectChanges();
    }

    setPlayers(players: string[]) {
        this.players = players;
    }

    cancel(): void {
        this.dialogRef.close(true);
        this.onlineSocketHandler.disconnectSocket();
    }
}
