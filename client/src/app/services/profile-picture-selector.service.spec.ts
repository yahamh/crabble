import { TestBed } from '@angular/core/testing';

import { ProfilePictureSelectorService } from './profile-picture-selector.service';

describe('ProfilePictureSelectorService', () => {
    let service: ProfilePictureSelectorService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ProfilePictureSelectorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
