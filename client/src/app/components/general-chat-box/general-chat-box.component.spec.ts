import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralChatBoxComponent } from './general-chat-box.component';

describe('GeneralChatBoxComponent', () => {
    let component: GeneralChatBoxComponent;
    let fixture: ComponentFixture<GeneralChatBoxComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GeneralChatBoxComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GeneralChatBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
