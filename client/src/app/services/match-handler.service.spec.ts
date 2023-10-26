import { TestBed } from '@angular/core/testing';

import { MatchHandlerService } from './match-handler.service';

describe('MatchHandlerService', () => {
  let service: MatchHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MatchHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
