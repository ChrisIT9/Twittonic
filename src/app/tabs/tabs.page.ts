import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { getOriginalTweetId } from 'src/utils/Misc';
import { EventsBroadcasterService } from '../services/events-broadcaster.service';
import { IndexedDBService } from '../services/indexed-db.service';
import { TwitterService } from '../services/twitter.service';
import { Tweet, TweetLikeResponse, TweetsResponse } from '../typings/Tweets';
import { User, UserResponse } from '../typings/TwitterUsers';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {
  isLoggedIn = false;
  userId: string;
  likedTweets: Partial<Tweet>[] = [];
  retweets: Partial<Tweet>[] = [];
  likedTweetsAlreadyLoaded = false;
  retweetsAlreadyLoaded = false;
  paginationToken: string;
  userInfo: User;

  constructor(
    private eventsBroadcaster: EventsBroadcasterService, 
    private twitterService: TwitterService, 
    private toastController: ToastController,
    private indexedDB: IndexedDBService
  ) {}

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

  async getLikedTweets(paginationToken?: string) {
    const accessToken = (await this.indexedDB.readFile({ path: "twittonic/accessToken" })).data;

    if (!accessToken) return;

    this.twitterService.getTweetsLikedByUser(this.userId, paginationToken).subscribe({ 
      next: ((res: Pick<TweetsResponse, 'data' | 'meta'>) => {
        this.likedTweetsAlreadyLoaded = true;
        res.data.length > 0 && this.likedTweets.push(...res.data);
        if (res.meta.result_count === 100 && res.meta.next_token) this.getLikedTweets(res.meta.next_token);
        else !this.retweetsAlreadyLoaded && this.getRetweetedTweets();
      }).bind(this),
      error: ((_) => {
        this.presentErrorToast("Qualcosa è andato storto.");
        this.eventsBroadcaster.newAuthEvent({ success: false, type: "firstLogin" });
      }).bind(this)
    })
  }

  async getRetweetedTweets(paginationToken?: string) {
    this.twitterService.getRetweets(this.userId, paginationToken).subscribe({
      next: ((res: TweetsResponse) => {
        this.retweetsAlreadyLoaded = true;
        const suitableTweets = res.data?.filter(tweet => tweet.referenced_tweets && tweet.referenced_tweets[0].type === "retweeted");

        suitableTweets?.map(async tweet => {
          const intermediaryTweetResponse = await this.twitterService.getTweetById(tweet.referenced_tweets[0].id).toPromise();
          const intermediaryTweet = intermediaryTweetResponse.data;

          if (!intermediaryTweet.referenced_tweets || (intermediaryTweet.referenced_tweets && intermediaryTweet.referenced_tweets[0].type !== "retweeted"))
            this.retweets.push(tweet) && this.retweets.push(intermediaryTweet);
          else {
            const { source, target } = getOriginalTweetId(tweet, res.includes);
            this.retweets.push({ id: target || source });
          }
        })

        if (res.data.length === 100 && res.meta.next_token) this.getRetweetedTweets(res.meta.next_token);
        else this.eventsBroadcaster.newAuthEvent({ success: true, type: "firstLogin", likedTweets: this.likedTweets, userInfo: this.userInfo, retweets: this.retweets });
      }).bind(this),
      error: ((_) => {
        this.presentErrorToast("Qualcosa è andato storto.");
        this.eventsBroadcaster.newAuthEvent({ success: false, type: "firstLogin" });
      }).bind(this)
    })
  }

  async init() {
    const accessToken = (await this.indexedDB.readFile({ path: "twittonic/accessToken" })).data;
    const clientToken = (await this.indexedDB.readFile({ path: "twittonic/clientToken" })).data;

    if (!clientToken) {
      this.twitterService.getClientToken().subscribe({
        next: (async (res) => {
          await this.indexedDB.writeFile({ path: "twittonic/clientToken", data: res.access_token });
          this.eventsBroadcaster.newAuthEvent({ type: "clientLogin", success: true });
        }).bind(this),
        error: ((_: any) => {
          this.presentErrorToast("Qualcosa è andato storto.", 500);
        }).bind(this)
      })
    } else this.eventsBroadcaster.newAuthEvent({ type: "clientLogin", success: true });

    if (!accessToken) {
      this.presentErrorToast("Token mancante o scaduto!"); 
      this.eventsBroadcaster.newAuthEvent({ success: false, type: "firstLogin" });
      return;
    } 

    this.twitterService.getMe().subscribe({ 
      next: ((res: UserResponse) => {
        this.userInfo = res.data;
        this.userId = this.userInfo.id;
        if (!this.likedTweetsAlreadyLoaded) this.getLikedTweets();
      }).bind(this),
      error: (async (_: any) => {
        this.presentErrorToast("Errore durante l'aggiornamento del feed!", 500);
      }).bind(this)
    });
  }

  ngOnInit(): void {
    this.init();

    this.eventsBroadcaster.authEventsObservable.subscribe(({ type, success, userId }) => {
      if ((type === "login" || type === "session" || type === "firstLogin") && success) {
        this.isLoggedIn = true;
      }
      if (type === "logout" || (type === "session" && !success)) {
        this.isLoggedIn = false;
        this.userId = undefined;
        this.likedTweetsAlreadyLoaded = false;
        this.likedTweets.splice(0);
        this.paginationToken = undefined;
      }
    })

    this.eventsBroadcaster.tweetEventsObservable.subscribe(({ tweetId, type, done, activatedTweet, update }) => {
      switch(type) {
        case "like":
          if (done) break;
          this.twitterService.likeTweet(this.userId, activatedTweet.actualTweet.id).subscribe({
            next: ((_: TweetLikeResponse) => {
              this.likedTweets.push(activatedTweet.actualTweet);
              this.eventsBroadcaster.newTweetEvent({ done: true, type, activatedTweet, tweetId: activatedTweet.actualTweet.id });
            }).bind(this),
            error: ((_: any) => {
              this.presentErrorToast("Qualcosa è andato storto", 500);
              activatedTweet.toggleLike();
            }).bind(this)
          })
          break;
      case "unlike":
        if (done) break;
        this.twitterService.unlikeTweet(this.userId, activatedTweet.actualTweet.id).subscribe({
          next: ((_: TweetLikeResponse) => {
            const tweetIndex = this.likedTweets.findIndex(likedTweet => likedTweet.id === activatedTweet.actualTweet.id);
            this.likedTweets.splice(tweetIndex, 1);
            this.eventsBroadcaster.newTweetEvent({ done: true, type, activatedTweet, tweetId: activatedTweet.actualTweet.id });
          }).bind(this),
          error: ((_: any) => {
            this.presentErrorToast("Qualcosa è andato storto", 500);
            activatedTweet.toggleLike();
          }).bind(this)
        })
        break;
      case "unretweet":
        if (done) break;
        this.twitterService.deleteRetweet(this.userId, activatedTweet.actualTweet.id).subscribe({
          next: ((_: any) => {
            const tweetIndex = this.retweets.findIndex(retweet => retweet.id === activatedTweet.actualTweet.id);
            tweetIndex && this.retweets.splice(tweetIndex, 1);
            activatedTweet.toggleRetweet();
            this.presentSuccessToast("Il feed verrà aggiornato tra 10 secondi."); 
            this.eventsBroadcaster.newTweetEvent({ done: true, type, activatedTweet, tweetId: activatedTweet.actualTweet.id });
          }).bind(this),
          error: ((_: any) => {
            this.presentErrorToast("Qualcosa è andato storto", 500);
          }).bind(this)
        })
        break;
      case "retweet":
        if (!done) break;
        if (update) this.retweets.push(activatedTweet.actualTweet);
        this.presentSuccessToast("Il feed verrà aggiornato tra 10 secondi."); 
        break;
      case "reply":
        if (!done) break;
        this.presentSuccessToast("Il feed verrà aggiornato tra 10 secondi."); 
        break;
      case "delete":
        if (!done) this.presentErrorToast("Qualcosa è andato storto.");
        else {
          let tweetIndex = this.likedTweets.findIndex(tweet => tweet.id === tweetId);
          if (tweetIndex !== -1) this.likedTweets.splice(tweetIndex, 1);
          tweetIndex = -1;
          tweetIndex = this.retweets.findIndex(tweet => tweet.id === tweetId);
          if (tweetIndex !== -1) this.retweets.splice(tweetIndex, 1);
          this.presentSuccessToast("Il feed verrà aggiornato tra 10 secondi."); 
        } 
        break;
      default:
        break;
      }
    })
  }

}
