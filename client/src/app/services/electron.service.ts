import { Injectable } from '@angular/core';
import { ipcRenderer as ipcRendererType } from 'electron';
import { Observable, Subject } from 'rxjs';

const ipcRenderer: typeof ipcRendererType = window.require('electron').ipcRenderer;

@Injectable({
    providedIn: 'root',
})
export class ElectronService {
    isChatDocked = true;

    private chatVisibilityChangedSubject = new Subject<boolean>()
    get chatVisibilityChanged$(): Observable<boolean> {
        return this.chatVisibilityChangedSubject
    }

    constructor() {
        // This code is only used by the main window.
        ipcRenderer.on('toggleChat', (event, args) => {
            this.isChatDocked = args;
            this.chatVisibilityChangedSubject.next(this.isChatDocked);
        });
    }

    toggleChatDocking() {
        ipcRenderer.send('toggleChat')
    }
}
