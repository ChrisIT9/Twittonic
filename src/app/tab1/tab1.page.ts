import { Component } from '@angular/core';
import { nanoid } from 'nanoid/async';
import { environment } from 'src/environments/environment';
import { EventsBroadcasterService } from '../services/events-broadcaster.service';
import { IndexedDBService } from '../services/indexed-db.service';
import { TwitterService } from '../services/twitter.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  loggedIn: boolean = false;

  constructor(private indexedDB: IndexedDBService, private eventsBroadcaster: EventsBroadcasterService, private twitterService: TwitterService) {
    
  }

  async startAuth() {
    const challenge = await nanoid(10);
    const state = await nanoid(10);

    await this.indexedDB.writeFile({
      path: `${environment.tempStoragePath}/state`,
      data: state
    })

    await this.indexedDB.writeFile({
      path: `${environment.tempStoragePath}/challenge`,
      data: challenge
    })

    const url = environment.twitterAuthUrl.replace(":CODE_CHALLENGE", challenge).replace(":STATE", state);
    const oAuthWindow = window.open(url, "_blank", "modal");

    const interval = setInterval(async () => {
      if (oAuthWindow.closed) {
        
        clearInterval(interval);
      }
    }, 500)

  }

}
