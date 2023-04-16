import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JokerListComponent } from './joker-list.component';

describe('JokerListComponent', () => {
  let component: JokerListComponent;
  let fixture: ComponentFixture<JokerListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JokerListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JokerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
