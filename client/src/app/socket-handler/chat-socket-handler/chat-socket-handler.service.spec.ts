import { TestBed } from '@angular/core/testing';

import { ChatSocketHandlerService } from './chat-socket-handler.service';

describe('ChatSocketHandlerService', () => {
    let service: ChatSocketHandlerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ChatSocketHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
