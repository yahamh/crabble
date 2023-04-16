import { Component, ComponentFactoryResolver, ElementRef, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { GameSocketHandlerService } from '@app/socket-handler/game-socket-handler/game-socket-handler.service';
import { EmojiComponent } from './emoji/emoji.component';

@Component({
    selector: 'app-reaction',
    templateUrl: './reaction.component.html',
    styleUrls: ['./reaction.component.scss']
})
export class ReactionComponent {
    @ViewChild("container", {read: ViewContainerRef}) private container: ViewContainerRef;

    @Input() name: string = "";

    emojis:EmojiComponent[] = []

    constructor(
        private componentFactoryResolver: ComponentFactoryResolver, 
        private elementRef: ElementRef<HTMLElement>,
        private gameSocket: GameSocketHandlerService
    ) {
        this.gameSocket.reaction$.subscribe(reaction => {
            if(reaction.user == this.name) {
                for(let i = 0 ; i < 7 ; i++) {
                    setTimeout(() => {
                        this.addEmoji(reaction.emoji);
                    }, Math.floor(Math.random()*1000));
                }
            }
        })
    }

    addEmoji(emoji: string) {
        let factory = this.componentFactoryResolver.resolveComponentFactory(EmojiComponent);
        let component = this.container.createComponent<EmojiComponent>(factory);

        component.instance.componentRef = component;

        component.instance.emoji = emoji;

        let boundingRect = this.elementRef.nativeElement.getBoundingClientRect();

        component.instance.x = Math.floor(boundingRect.x + Math.random() * boundingRect.width);

        if(this.name == "OB") {
            component.instance.y = Math.floor(boundingRect.y + Math.random() * boundingRect.height);
            component.instance.size = Math.floor(25 + Math.random() * 100);
        }
        else {
            component.instance.y = Math.floor(boundingRect.y + boundingRect.height/2 + Math.random() * boundingRect.height/2);
            component.instance.size = Math.floor(15 + Math.random() * 30);
        }

        
        component.instance.startAnimation();
    }

}
