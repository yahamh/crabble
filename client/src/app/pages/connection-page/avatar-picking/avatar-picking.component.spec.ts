import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvatarPickingComponent } from './avatar-picking.component';

describe('AvatarPickingComponent', () => {
  let component: AvatarPickingComponent;
  let fixture: ComponentFixture<AvatarPickingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AvatarPickingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AvatarPickingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
