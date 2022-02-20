import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { getExpandedTweets } from 'src/utils/Misc';
import { EventsBroadcasterService } from '../services/events-broadcaster.service';
import { TwitterService } from '../services/twitter.service';
import { ExpandedTweet, Tweet, TweetsResponse } from '../typings/Tweets';
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
  ready = false;
  currentTopic: string;
  query: string;
  loadingBox: HTMLIonLoadingElement;
  empty = true;
  alreadySearching = false;
  lastQuery: string;
  isHashtag: boolean;
  updateModel = true;
  verifiedOnly = true;
  sortOrder: string = "relevancy";
  numberOfResults: number | string = 30;
  shouldRefresh = false;
  searchInProgress = false;

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
        console.log("we back");
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
            const maxResults = res.get("max_results");
            const sortOrder = res.get("sort_order");
            const verifiedOnly = res.get("verified_only");

            this.numberOfResults = maxResults || "20";
            this.sortOrder = sortOrder || "relevancy";
            this.verifiedOnly = verifiedOnly === "true" || verifiedOnly === null;

            if ((this.shouldRefresh && !this.isHashtag) || (search && search !== this.lastQuery)) {
              this.tweets.splice(0);
              this.query = search;
              this.isHashtag = false;
              this.updateModel = true;
              this.shouldRefresh = false;
              this.getTweets({ queryTerm: this.query });
            } else if ((this.shouldRefresh && this.isHashtag) || (hashtag && hashtag !== this.lastQuery)) {
              this.tweets.splice(0);
              this.query = hashtag;
              this.isHashtag = true;
              this.updateModel = false;
              this.shouldRefresh = false;
              this.getTweets({ hashtag });
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
    if ((!hashtag && !queryTerm) || this.searchInProgress) return;

    this.lastQuery = hashtag || queryTerm;

    this.empty = false;
    this.presentLoading();

    this.searchInProgress = true;

    this.twitterService.search({ term: queryTerm, hashtag, verifiedOnly: this.verifiedOnly, sortOrder: this.sortOrder, nResults: this.numberOfResults }).subscribe({
      next: (async (res: TweetsResponse) => {
        const expandedTweets = await getExpandedTweets(res, this.twitterService);
        if (expandedTweets) this.tweets.push(...expandedTweets.filter(item => item));
        else this.empty = true;
        await this.loadingBox.dismiss();
        this.alreadySearching = false;
        this.updateModel = true;
        this.searchInProgress = false;
      }).bind(this),
      error: (async (_: any) => {
        await this.loadingBox.dismiss();
        this.toastController.create({ message: "Si è verificato un errore!", position: "top", color: "danger", duration: 1500 });
        this.alreadySearching = false;
        this.updateModel = true;
        this.searchInProgress = false;
      }).bind(this)
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

  toggleVerified(event: any) {
    this.shouldRefresh = true;
    if (this.isHashtag) {
      this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: { 
        search: null, 
        hashtag: this.query, 
        max_results: this.numberOfResults,
        sort_order: this.sortOrder,
        verified_only: event.detail.checked
      }, queryParamsHandling: "merge" })
    } 
    else {
      this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: { 
        search: this.query, 
        hashtag: null, 
        max_results: this.numberOfResults,
        sort_order: this.sortOrder,
        verified_only: event.detail.checked
      }, queryParamsHandling: "merge" })
    } 
  }

  changeSortOrder(event: any) {
    this.shouldRefresh = true;
    if (this.isHashtag) {
      this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: { 
        search: null, 
        hashtag: this.query, 
        max_results: this.numberOfResults,
        sort_order: event.detail.value,
        verified_only: this.verifiedOnly
      }, queryParamsHandling: "merge" })
    } 
    else {
      this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: { 
        search: this.query, 
        hashtag: null, 
        max_results: this.numberOfResults,
        sort_order: event.detail.value,
        verified_only: this.verifiedOnly
      }, queryParamsHandling: "merge" })
    } 
  }

  changeNumberOfResults(event: any) {
    this.shouldRefresh = true;
    if (this.isHashtag) {
      this.tweets.splice(0);
      this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: { 
        search: null, 
        hashtag: this.query, 
        max_results: event.detail.value,
        sort_order: this.sortOrder,
        verified_only: this.verifiedOnly
      }, queryParamsHandling: "merge" })
    } 
    else {
      this.tweets.splice(0);
      this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: { 
        search: this.query, 
        hashtag: null, 
        max_results: event.detail.value,
        sort_order: this.sortOrder,
        verified_only: this.verifiedOnly
      }, queryParamsHandling: "merge" })
    }
  }

}
