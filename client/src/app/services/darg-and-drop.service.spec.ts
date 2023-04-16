import { TestBed } from '@angular/core/testing';

import { DragAndDropService } from './drag-and-drop.service';

describe('DargAndDropService', () => {
  let service: DragAndDropService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DragAndDropService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
