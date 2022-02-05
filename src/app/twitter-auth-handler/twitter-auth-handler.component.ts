import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
    private indexedDB: IndexedDBService, private eventsBroadcaster: EventsBroadcasterService,
    private router: Router) {
    this.code = this.activatedRoute.snapshot.queryParams['code'];
    this.state = this.activatedRoute.snapshot.queryParams['state'];
    this.error = this.activatedRoute.snapshot.queryParams['error'];
  }

  async ngOnInit() {
    if (this.error) {
      await this.indexedDB.deleteFile({ path: `${environment.tempStoragePath}/state` });
      await this.indexedDB.deleteFile({ path: `${environment.tempStoragePath}/challenge` });
      return;
    } 
    this.getTokens();
  }

  async getTokens() {
    if (this.code && this.state) {
      const originalState = (await this.indexedDB.popFile({ path: `${environment.tempStoragePath}/state` })).data;
      if (this.state === originalState) {
        (await this.twitterService.getTokens(this.code)).subscribe(async res => {
          await this.twitterService.saveTokens(res);
          this.router.navigateByUrl("/home");
        })
      } else {
        await this.indexedDB.deleteFile({ path: `${environment.tempStoragePath}/state` });
        await this.indexedDB.deleteFile({ path: `${environment.tempStoragePath}/challenge` });
        this.error = "Il parametro state non corrisponde!";
        return;
      }
    }
  }

}
