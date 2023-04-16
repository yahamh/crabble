import { Component, EventEmitter, Output } from '@angular/core';
import { DEFAULT_PROFILE_PICTURE_DATA } from 'src/constants/default-profile-picture.constants';

@Component({
    selector: 'app-avatar-picking',
    templateUrl: './avatar-picking.component.html',
    styleUrls: ['./avatar-picking.component.scss']
})
export class AvatarPickingComponent {

    @Output() imageChanged = new EventEmitter<string>()

    readonly profilePictures = DEFAULT_PROFILE_PICTURE_DATA;

    currentPicture: number = 0;

    listOpened: boolean = false;

    constructor() { }

    imageSourceFromId(id: number): string {
        let source = this.profilePictures.find(value => value.id == id)?.source;
        if(source) {
            return source;
        }
        else {
            return ""
        }
    }

    openList() {
        this.listOpened = !this.listOpened;
    }

    select(id: number) {
        this.listOpened = false;
        this.currentPicture = id;
        this.imageChanged.emit(`${this.currentPicture}`)
    }

}
