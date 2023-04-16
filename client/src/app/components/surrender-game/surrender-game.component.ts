import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmationMessageComponent } from '@app/components/confirmation-message/confirmation-message.component';
import { ConfirmationService } from '@app/services/confirmation.service';
import { UITextUtil } from '@app/services/ui-text-util';
import { ChatSocketClientService } from 'src/app/services/chat-socket-client.service';
@Component({
    selector: 'app-surrender-game',
    templateUrl: './surrender-game.component.html',
    styleUrls: ['./surrender-game.component.scss'],
})
export class SurrenderGameComponent implements OnInit {
    isGameFinished = false;
    constructor(public router: Router, private dialog: MatDialog, public socketService: ChatSocketClientService) {}

    text(key: string): string {
        return UITextUtil.getText(key);
    }

    ngOnInit(): void {
        this.connect();
    }

    connect() {
        this.configureBaseSocketFeatures();
    }
    configureBaseSocketFeatures() {
        this.socketService.on('end-game', () => {
            this.isGameFinished = true;
        });
    }
    popUp() {
        const message = new ConfirmationService(this.text('confirmForfeit'), this.text('doYouWantToForfeit'));
        const messageRef = this.dialog.open(ConfirmationMessageComponent, {
            maxWidth: '400px',
            closeOnNavigation: true,
            data: message,
        });
        messageRef.afterClosed();
    }
    leaveGame() {
        this.socketService.send('quit-game');
        this.router.navigate(['/']);
    }
}
