import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { getExpandedTweets } from 'src/utils/Misc';
import { EventsBroadcasterService } from '../services/events-broadcaster.service';
import { TwitterService } from '../services/twitter.service';
import { ExpandedTweet, Tweet } from '../typings/Tweets';
import { User } from '../typings/TwitterUsers';


@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {

  topics = ["xqcow", "twitch", "nopixel", "langbuddha", "sykkuno", "pokelawls", "jerma", "hasanabi"];
  tweets: ExpandedTweet[] = [];
  userInfo: User | undefined;
  likedTweets: Partial<Tweet>[] = [];
  retweets: Partial<Tweet>[] = [];
  paginationToken: string;
  infiniteScrollTarget: any;
  timeoutId: any | undefined = undefined;
  ready = false;
  currentTopic: string;
  query: string;
  loadingBox: HTMLIonLoadingElement;
  empty = true;
  alreadySearching = false;
  lastQuery: string;
  isHashtag: boolean;
  updateModel = true;

  constructor(
    private twitterService: TwitterService, 
    private eventsBroadcaster: EventsBroadcasterService, 
    private loadingController: LoadingController,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private toastController: ToastController
  ) {
    this.eventsBroadcaster.authEventsObservable.subscribe(({ type, success, likedTweets, userInfo, retweets }) => {
      if (type === "firstLogin" && success && likedTweets && userInfo && retweets) {
        this.likedTweets = likedTweets;
        this.retweets = retweets;
        this.userInfo = userInfo;
        this.ready = true;
      }
    })
  }

  ngOnInit() {
    if (!this.ready) this.router.navigateByUrl("/");
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && !this.alreadySearching) {
        if (this.router.url.toLowerCase().includes("/browse")) {
          this.activatedRoute.queryParamMap.subscribe(res => {
            this.alreadySearching = true;
            const search = res.get("search");
            const hashtag = res.get("hashtag");

            if (search && search !== this.lastQuery) {
              this.tweets.splice(0);
              this.query = search;
              this.getTweets({ queryTerm: this.query });
              this.isHashtag = false;
              this.updateModel = true;
            } else if (hashtag && hashtag !== this.lastQuery) {
              this.tweets.splice(0);
              this.query = hashtag;
              this.getTweets({ hashtag });
              this.isHashtag = true;
              this.updateModel = false;
            }
          });
        }
      }
    })
  }

  async presentLoading() {
    this.loadingBox = await this.loadingController.create({
      message: 'Caricamento...',
    });
    await this.loadingBox.present();
  }

  getTweets({ hashtag, queryTerm }: { hashtag?: string, queryTerm?: string }) {
    if (!hashtag && !queryTerm) return;

    this.lastQuery = hashtag || queryTerm;

    this.empty = false;
    this.presentLoading();

    this.twitterService.search({ term: queryTerm, hashtag }).subscribe({
      next: (async (res) => {
        const expandedTweets = await getExpandedTweets(res, this.twitterService);
        if (expandedTweets) this.tweets.push(...expandedTweets.filter(item => item));
        else this.empty = true;
        await this.loadingBox.dismiss();
        this.alreadySearching = false;
        this.updateModel = true;
      }).bind(this),
      error: (async (_: any) => {
        await this.loadingBox.dismiss();
        this.toastController.create({ message: "Si è verificato un errore!", position: "top", color: "danger", duration: 1500 });
        this.alreadySearching = false;
        this.updateModel = true;
      })
    })
  }

  tweetHasBeenLiked(tweet: Tweet) {
    return this.likedTweets.some(likedTweet => {
      return likedTweet.id === tweet.id || (tweet.referenced_tweets && tweet.referenced_tweets[0].type === "retweeted" && tweet.referenced_tweets[0].id === likedTweet.id)
    });
  }

  startNavigation() {
    if (!this.updateModel) return;
    if (!this.query) this.query = null;
    this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: { search: this.query, hashtag: null }, queryParamsHandling: "merge" })
  }

  

}
