import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileEditionPageComponent } from './profile-edition-page.component';

describe('ProfileEditionPageComponent', () => {
  let component: ProfileEditionPageComponent;
  let fixture: ComponentFixture<ProfileEditionPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileEditionPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileEditionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
