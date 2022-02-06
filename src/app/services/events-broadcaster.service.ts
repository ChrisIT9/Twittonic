import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthEvent } from '../typings/Events';

@Injectable({
  providedIn: 'root'
})
export class EventsBroadcasterService {
  private authEvents = new BehaviorSubject<AuthEvent>({});
  authEventsObservable = this.authEvents.asObservable();

  newAuthEvent(event: AuthEvent) {
    this.authEvents.next(event);
  }

  constructor() {
  }
   

}
