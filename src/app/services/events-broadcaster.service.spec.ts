import { TestBed } from '@angular/core/testing';

import { EventsBroadcasterService } from './events-broadcaster.service';

describe('EventsBroadcasterService', () => {
  let service: EventsBroadcasterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventsBroadcasterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
