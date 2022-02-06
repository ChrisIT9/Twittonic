import { Component, OnInit } from '@angular/core';
import { EventsBroadcasterService } from '../services/events-broadcaster.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {
  isLoggedIn = false;

  constructor(private eventsBroadcaster: EventsBroadcasterService) {}

  ngOnInit(): void {
    this.eventsBroadcaster.authEventsObservable.subscribe(({ type, success }) => {
      if ((type === "login" && success) || (type === "session" && success)) {
        this.isLoggedIn = true;
      }
      if (type === "logout" || (type === "session" && !success)) {
        this.isLoggedIn = false;
      }
    })
  }

}
