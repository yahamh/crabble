import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionStatisticsComponent } from './connection-statistics.component';

describe('ConnectionStatisticsComponent', () => {
    let component: ConnectionStatisticsComponent;
    let fixture: ComponentFixture<ConnectionStatisticsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConnectionStatisticsComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ConnectionStatisticsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
