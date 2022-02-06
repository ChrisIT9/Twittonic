import { Component, OnInit } from '@angular/core';
import { nanoid } from 'nanoid/async';
import { environment } from 'src/environments/environment';
import { EventsBroadcasterService } from '../services/events-broadcaster.service';
import { IndexedDBService } from '../services/indexed-db.service';
import { TwitterService } from '../services/twitter.service';
import { User } from '../typings/TwitterUsers';
import { ToastController } from '@ionic/angular';
import { ExpandedTweet, Tweet, TweetsResponse } from '../typings/Tweets';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  userInfo: User | undefined;
  loading = true;
  tweetContent: string | undefined;
  ownTweets: ExpandedTweet[] = [];
  tweetSending = false;
  tweetsLoading = true;

  constructor(private indexedDB: IndexedDBService, 
    private eventsBroadcaster: EventsBroadcasterService, 
    private twitterService: TwitterService,
    private toastController: ToastController) {
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
      this.tweetsLoading = false;
      this.presentErrorToast("Token mancante o scaduto!");
      return;
    } 
      
    this.twitterService.getMe().subscribe(res => {
      this.loading = false;
      this.userInfo = res.data;
      this.getOwnTweets();
    });
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: "top"
    });
    toast.present();
  }

  private presentSuccessToast(message: string) {
    this.presentToast(message, "success");
  }

  private presentErrorToast(message: string) {
    this.presentToast(message, "danger");
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
        this.presentSuccessToast("Tweet postato correttamente!"); 
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
    this.twitterService.getTweets(this.userInfo.id).subscribe(res => {
      this.ownTweets = res.data.map(item => {
        this.tweetsLoading = false;
        const { username, name, profile_image_url } = res.includes.users.find(user => user.id === item.author_id);
        return { ...item, username, name, profile_image_url };
      })
    })
  }

}
