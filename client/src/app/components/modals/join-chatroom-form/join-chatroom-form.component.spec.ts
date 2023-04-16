import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinChatroomFormComponent } from './join-chatroom-form.component';

describe('JoinChatroomFormComponent', () => {
    let component: JoinChatroomFormComponent;
    let fixture: ComponentFixture<JoinChatroomFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [JoinChatroomFormComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JoinChatroomFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
