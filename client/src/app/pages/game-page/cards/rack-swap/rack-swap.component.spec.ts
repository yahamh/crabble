import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RackSwapComponent } from './rack-swap.component';

describe('RackSwapComponent', () => {
    let component: RackSwapComponent;
    let fixture: ComponentFixture<RackSwapComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RackSwapComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RackSwapComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
