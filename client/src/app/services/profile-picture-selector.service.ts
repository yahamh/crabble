import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ProfilePictureSelectorService {
    currentSelectionId: number | null;
    constructor() {
        this.currentSelectionId = null;
    }
}
