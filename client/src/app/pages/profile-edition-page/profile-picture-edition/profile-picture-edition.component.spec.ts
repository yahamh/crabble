import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilePictureEditionComponent } from './profile-picture-edition.component';

describe('ProfilePictureEditionComponent', () => {
  let component: ProfilePictureEditionComponent;
  let fixture: ComponentFixture<ProfilePictureEditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfilePictureEditionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilePictureEditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
