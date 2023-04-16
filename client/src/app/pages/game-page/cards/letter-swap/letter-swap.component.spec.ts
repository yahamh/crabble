import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LetterSwapComponent } from './letter-swap.component';

describe('LetterSwapComponent', () => {
    let component: LetterSwapComponent;
    let fixture: ComponentFixture<LetterSwapComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LetterSwapComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LetterSwapComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
