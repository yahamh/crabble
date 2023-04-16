import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LetterSwitchComponent } from './letter-switch.component';

describe('LetterSwitchComponent', () => {
  let component: LetterSwitchComponent;
  let fixture: ComponentFixture<LetterSwitchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LetterSwitchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LetterSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
