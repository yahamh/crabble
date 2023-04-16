import { TestBed } from '@angular/core/testing';

import { FriendsSocketHandlerService } from './notification-service';

describe('FriendsSocketHandlerService', () => {
  let service: FriendsSocketHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FriendsSocketHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
