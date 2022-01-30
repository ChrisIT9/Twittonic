import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { EventsBroadcasterService } from '../services/events-broadcaster.service';
import { IndexedDBService } from '../services/indexed-db.service';
import { TwitterService } from '../services/twitter.service';

@Component({
  selector: 'app-twitter-auth-handler',
  templateUrl: './twitter-auth-handler.component.html',
  styleUrls: ['./twitter-auth-handler.component.scss'],
})
export class TwitterAuthHandlerComponent implements OnInit {
  code: string;
  state: string;
  error: string | undefined;

  constructor(private activatedRoute: ActivatedRoute, 
    private twitterService: TwitterService,
    private indexedDB: IndexedDBService, private eventsBroadcaster: EventsBroadcasterService) {
    this.code = this.activatedRoute.snapshot.queryParams['code'];
    this.state = this.activatedRoute.snapshot.queryParams['state'];
    this.error = this.activatedRoute.snapshot.queryParams['error'];
  }

  async ngOnInit() {
    this.getTokens();
  }

  async getTokens() {
    if (this.code && this.state) {
      const originalState = (await this.indexedDB.popFile({ path: `${environment.tempStoragePath}/state` })).data;
      if (this.state === originalState) {
        (await this.twitterService.getTokens(this.code)).subscribe(async res => {
          await this.indexedDB.writeFile({ path: "twittonic/accessToken", data: res.access_token });
          await this.indexedDB.writeFile({ path: "twittonic/refreshToken", data: res.refresh_token });
          await this.indexedDB.writeFile({ path: "twittonic/expiresIn", data: String(res.expires_in) });
          await this.indexedDB.writeFile({ path: "twittonic/createdAt", data: String(Math.round(Date.now() / 1000)) });
          this.twitterService.getTimeline(res.access_token).subscribe(res => console.log(res));
        })
      } else {
        this.error = "Il parametro state non corrisponde!";
        return;
      }
    }
  }

  

}
