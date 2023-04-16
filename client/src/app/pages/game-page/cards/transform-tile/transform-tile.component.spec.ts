import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransformTileComponent } from './transform-tile.component';

describe('TransformTileComponent', () => {
    let component: TransformTileComponent;
    let fixture: ComponentFixture<TransformTileComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TransformTileComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TransformTileComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
