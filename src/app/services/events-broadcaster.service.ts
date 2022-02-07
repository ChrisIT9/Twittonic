import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthEvent, TokenEvent } from '../typings/Events';

@Injectable({
  providedIn: 'root'
})
export class EventsBroadcasterService {
  private authEvents = new BehaviorSubject<AuthEvent>({});
  authEventsObservable = this.authEvents.asObservable();

  private tokenEvents = new BehaviorSubject<TokenEvent>({});
  tokenEventsObservable = this.tokenEvents.asObservable();

  newAuthEvent(event: AuthEvent) {
    this.authEvents.next(event);
  }

  newTokenEvent(event: TokenEvent) {
    this.tokenEvents.next(event);
  }

  constructor() {
  }
   

}
