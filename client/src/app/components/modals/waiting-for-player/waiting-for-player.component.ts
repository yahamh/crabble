import { AfterContentChecked, ChangeDetectorRef, Component } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { ConvertToSoloFormComponent } from '@app/components/modals/convert-to-solo-form/convert-to-solo-form.component';
import { UITextUtil } from '@app/services/ui-text-util';
import { NewOnlineGameSocketHandler } from '@app/socket-handler/new-online-game-socket-handler/new-online-game-socket-handler.service';
import { Observable } from 'rxjs';

const SPINNER_WIDTH_STROKE = 7;
const SPINNER_DIAMETER = 40;
@Component({
    selector: 'app-waiting-for-player',
    templateUrl: './waiting-for-player.component.html',
    styleUrls: ['./waiting-for-player.component.scss'],
})
export class WaitingForPlayerComponent implements AfterContentChecked {
    spinnerStrokeWidth = SPINNER_WIDTH_STROKE;
    spinnerDiameter = SPINNER_DIAMETER;
    botDifficulty: string;
    isSoloStarted: boolean = false;

    capacity: number = 4;
    players: string[] = [];

    gameId: string = '';

    constructor(
        private dialogRef: MatDialogRef<WaitingForPlayerComponent>,
        private dialog: MatDialog,
        private cdref: ChangeDetectorRef,
        private onlineSocketHandler: NewOnlineGameSocketHandler,
    ) {}

    text(key: string): string {
        return UITextUtil.getText(key);
    }

    addPlayer(name: string) {
        this.players.push(name);
    }

    setPlayers(players: string[]) {
        this.players = players;
    }

    ngAfterContentChecked() {
        this.cdref.detectChanges();
    }

    convertToModeSolo() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        dialogConfig.disableClose = true;
        dialogConfig.minWidth = 60;

        const botDifficultyForm = this.dialog.open(ConvertToSoloFormComponent, dialogConfig);
        botDifficultyForm.afterClosed().subscribe((botDifficulty: string) => {
            if (!botDifficulty) {
                return;
            }
            this.botDifficulty = botDifficulty;
            this.isSoloStarted = true;
            this.dialogRef.close(this.botDifficulty);
        });
    }

    cancel() {
        this.onlineSocketHandler.disconnectSocket();
    }

    startGame() {
        this.onlineSocketHandler.startGame(this.gameId);
    }

    kickPlayer(name: string) {
        this.onlineSocketHandler.kickPlayer(this.gameId, name);
    }

    get pendingGameId$(): Observable<string> {
        return this.onlineSocketHandler.pendingGameId$;
    }
}
