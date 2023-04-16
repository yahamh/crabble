import { Component, ComponentRef, Input } from '@angular/core';

@Component({
    selector: 'app-emoji',
    templateUrl: './emoji.component.html',
    styleUrls: ['./emoji.component.scss']
})
export class EmojiComponent {

    @Input() componentRef: ComponentRef<EmojiComponent>;

    @Input() x: number;
    @Input() y: number;
    @Input() size: number;
    @Input() emoji: string;

    opacity = 1;

    private xOffest = 0;
    private ySpeed = 5;

    private time = 0;

    computedX = 0;

    startAnimation() {
        this.y -= this.ySpeed;
        this.y = Math.floor(this.y);
        this.computedX = this.x + this.xOffest;

        this.xOffest = Math.floor(10 * Math.sin(1.5 * 2 * Math.PI * this.time/1000));

        this.ySpeed *= 0.95;

        this.opacity = 1-this.time/2000;

        if(this.time < 2000) {
            setTimeout(() => {
                this.time += 50;
                this.startAnimation();
            }, 50);
        }
        else {
            this.componentRef.destroy();
        }
    }

}
