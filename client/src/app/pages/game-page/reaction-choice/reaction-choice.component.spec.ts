import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactionChoiceComponent } from './reaction-choice.component';

describe('ReactionChoiceComponent', () => {
  let component: ReactionChoiceComponent;
  let fixture: ComponentFixture<ReactionChoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReactionChoiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReactionChoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
