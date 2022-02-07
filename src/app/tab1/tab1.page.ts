import { Component, OnInit } from '@angular/core';
import { nanoid } from 'nanoid/async';
import { environment } from 'src/environments/environment';
import { EventsBroadcasterService } from '../services/events-broadcaster.service';
import { IndexedDBService } from '../services/indexed-db.service';
import { TwitterService } from '../services/twitter.service';
import { User, UserResponse } from '../typings/TwitterUsers';
import { PopoverController, ToastController } from '@ionic/angular';
import { ExpandedTweet, Tweet, TweetsResponse } from '../typings/Tweets';
import { getExpandedTweets } from 'src/utils/Misc';
import { SettingsPopoverComponent } from '../components/settings-popover/settings-popover.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  userInfo: User | undefined;
  userInfoLoading = false;
  tweetContent: string | undefined;
  ownTweets: ExpandedTweet[] = [];
  tweetSending = false;
  tweetsLoading = false;

  constructor(private indexedDB: IndexedDBService, 
    private eventsBroadcaster: EventsBroadcasterService, 
    private twitterService: TwitterService,
    private toastController: ToastController,
    private popoverController: PopoverController) {
  }
  
  ngOnInit(): void {
    this.getUserData();
    this.eventsBroadcaster.authEventsObservable.subscribe(async ({ type, success }) => {
      if (type === "logout") {
        this.userInfo = undefined;
        this.ownTweets = [];
        await this.indexedDB.deleteMultiple("twittonic/accessToken", "twittonic/refreshToken", "twittonic/createdAt", "twittonic/expiresIn");
        if (success) this.presentSuccessToast("Disconnessione effettuata con successo.");
        else this.presentErrorToast("Errore durante la disconnessione!");
      }
    })

    this.eventsBroadcaster.tokenEventsObservable.subscribe(async ({ type, success }) => {
      if (type === "expired") {
        this.presentErrorToast("I token sono scaduti!", 5000);
        this.userInfo = undefined;
        this.ownTweets = [];
        this.userInfoLoading = false;
        this.tweetsLoading = false;
        this.eventsBroadcaster.newAuthEvent({ type: "logout", success: true });
      }
      if (type === "refreshed" && success) {
        this.presentSuccessToast("I token sono stati aggiornati!");
      }
    })
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

  async getUserData(ev?: any) {
    this.userInfoLoading = true;
    const accessToken = (await this.indexedDB.readFile({ path: "twittonic/accessToken" })).data;

    if (!accessToken) {
      this.userInfoLoading = false;
      if (ev) this.presentErrorToast("Token mancante o scaduto!");
      return;
    } 

    this.presentInfoToast("Aggiornamento feed...");
      
    this.twitterService.getMe().subscribe({ 
      next: ((res: UserResponse) => {
      this.eventsBroadcaster.newAuthEvent({ type: "session", success: true });
      this.userInfoLoading = false;
      this.userInfo = res.data;
      this.getOwnTweets();
      }).bind(this),
      error: (async (_: any) => {
        this.presentErrorToast("Errore durante l'aggiornamento del feed!");
        this.userInfoLoading = false;
      }).bind(this)
    });
  }

  async presentToast(message: string, color: string, duration: number) {
    const toast = await this.toastController.create({
      message,
      duration,
      color,
      position: "top"
    });
    toast.present();
  }

  private presentSuccessToast(message: string, duration = 2000) {
    this.presentToast(message, "success", duration);
  }

  private presentErrorToast(message: string, duration = 2000) {
    this.presentToast(message, "danger", duration);
  }

  private presentInfoToast(message: string, duration = 2000) {
    this.presentToast(message, "primary", duration);
  }

  postTweet() {
    if (!this.tweetContent) {
      this.presentErrorToast("Contenuto del tweet non valido!");
      return;
    }

    this.tweetSending = true;
    const tweet = {
      text: this.tweetContent
    };

    this.twitterService.postTweet(tweet).subscribe({ 
      next: (() => { 
        this.tweetSending = false;
        this.tweetContent = undefined;
        this.presentSuccessToast("Tweet postato correttamente!<br>Il feed verrà aggiornato tra 10 secondi."); 
        setTimeout(this.getUserData.bind(this), 10000);
      }).bind(this), 
      error: (() => { 
        this.tweetSending = false;
        this.presentErrorToast("Errore durante l'invio del tweet!") 
      }).bind(this) 
    })
  }

  getOwnTweets() {
    this.tweetsLoading = true;

    this.twitterService.getTweets(this.userInfo.id).subscribe({
      next: ((res: TweetsResponse) => {
        this.ownTweets = getExpandedTweets(res);
        this.tweetsLoading = false;
        this.presentInfoToast("Feed aggiornato.");
      }).bind(this),
      error: ((_: any) => {
        this.tweetsLoading = false;
        this.presentErrorToast("Errore durante il caricamento dei tweet!");
      }).bind(this)
    })
  }

  async showSettings(ev: any) {
    const popover = await this.popoverController.create({
      component: SettingsPopoverComponent,
      event: ev,
      translucent: true,
      componentProps: { username: this.userInfo.username },
      dismissOnSelect: true
    });
    await popover.present();
  }

}
