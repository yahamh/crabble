import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsernameEditionComponent } from './username-edition.component';

describe('UsernameEditionComponent', () => {
  let component: UsernameEditionComponent;
  let fixture: ComponentFixture<UsernameEditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsernameEditionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UsernameEditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
