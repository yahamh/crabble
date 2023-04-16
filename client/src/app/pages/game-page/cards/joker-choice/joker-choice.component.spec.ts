import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JokerChoiceComponent } from './joker-choice.component';

describe('JokerChoiceComponent', () => {
    let component: JokerChoiceComponent;
    let fixture: ComponentFixture<JokerChoiceComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [JokerChoiceComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JokerChoiceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
