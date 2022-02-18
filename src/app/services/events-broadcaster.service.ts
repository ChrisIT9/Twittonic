import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthEvent, TokenEvent, TweetEvent } from '../typings/Events';

@Injectable({
  providedIn: 'root'
})
export class EventsBroadcasterService {
  private authEvents = new BehaviorSubject<AuthEvent>({});
  authEventsObservable = this.authEvents.asObservable();

  private tokenEvents = new BehaviorSubject<TokenEvent>({});
  tokenEventsObservable = this.tokenEvents.asObservable();

  private tweetEvents = new BehaviorSubject<TweetEvent>({});
  tweetEventsObservable = this.tweetEvents.asObservable();

  newAuthEvent(event: AuthEvent) {
    this.authEvents.next(event);
  }

  newTokenEvent(event: TokenEvent) {
    this.tokenEvents.next(event);
  }

  newTweetEvent(event: TweetEvent) {
    this.tweetEvents.next(event);
  }

  constructor() {
  }
   

}
