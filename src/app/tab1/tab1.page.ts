import { Component, OnInit } from '@angular/core';
import { nanoid } from 'nanoid/async';
import { environment } from 'src/environments/environment';
import { EventsBroadcasterService } from '../services/events-broadcaster.service';
import { IndexedDBService } from '../services/indexed-db.service';
import { TwitterService } from '../services/twitter.service';
import { User } from '../typings/TwitterUsers';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  userInfo: User | undefined;
  loading = true;

  constructor(private indexedDB: IndexedDBService, private eventsBroadcaster: EventsBroadcasterService, private twitterService: TwitterService) {
    
  }
  
  ngOnInit(): void {
    this.getUserData();
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
    window.open(url, "_self");
  }

  async getUserData() {
    this.loading = true;
    const accessToken = (await this.indexedDB.readFile({ path: "twittonic/accessToken" })).data;
    if (!accessToken) {
      this.loading = false;
      return;
    } 
      
    this.twitterService.getMe().subscribe(res => {
      this.loading = false;
      this.userInfo = res.data;
    });
  }

}
