import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonRouterOutlet, ModalController, PopoverController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { EventsBroadcasterService } from 'src/app/services/events-broadcaster.service';
import { TwitterService } from 'src/app/services/twitter.service';
import { TweetEvent } from 'src/app/typings/Events';
import { ExpandedTweet, Metrics, Tweet } from 'src/app/typings/Tweets';
import { QuoteModalComponent } from '../quote-modal/quote-modal.component';
import { TweetSettingsPopoverComponent } from '../tweet-settings-popover/tweet-settings-popover.component';

@Component({
  selector: 'app-tweet',
  templateUrl: './tweet.component.html',
  styleUrls: ['./tweet.component.scss']
})
export class TweetComponent implements OnInit {
  @Input() tweet: ExpandedTweet;
  @Input() liked: boolean;
  @Input() userId: string | number;
  @Input() retweeted: boolean;
  @Input() retweets: Partial<Tweet>[];
  toBeDeleted = false;
  publicMetrics: Metrics;
  actualTweet: Tweet;
  tweetEventsObservable: Observable<TweetEvent>;
  
  constructor(
    private modalController: ModalController, 
    private popoverController: PopoverController, 
    private eventsBroadcaster: EventsBroadcasterService,
    private routerOutlet: IonRouterOutlet
    ) {}

  ngOnInit() {
    this.tweetEventsObservable = this.eventsBroadcaster.tweetEventsObservable;

    this.tweetEventsObservable.subscribe(({ done, tweetId, type, activatedTweet }) => {
      if (done && tweetId === this.actualTweet?.id && activatedTweet !== this) {
        if (type === "like" || type === "unlike") this.publicMetrics.like_count += this.liked ? -1 : 1;
        if (type === "retweet" || type === "unretweet") this.toggleRetweet();
        if (type === "reply") this.publicMetrics.reply_count++;
        if (type === "delete" && done && tweetId === this.actualTweet.id) this.toBeDeleted = true;
      }
    })

    if (this.tweet.referenced_tweets) {
      if (this.tweet.intermediaryTweet) {
        if (this.tweet.referenced_tweets[0].type === "retweeted") {
          this.publicMetrics = this.tweet.retweetedTweet.public_metrics;
          this.actualTweet = this.tweet.retweetedTweet;
        } else {
          this.publicMetrics = this.tweet.public_metrics;
          this.actualTweet = this.tweet;
        }
      } else {
        this.publicMetrics = this.tweet.retweetedTweet.public_metrics;
        this.actualTweet = this.tweet.retweetedTweet;
      } 
    } else { 
      this.publicMetrics = this.tweet.public_metrics;
      this.actualTweet = this.tweet;
    }

    this.retweeted = this.retweets.some(retweet => retweet.id === this.actualTweet.id);
  }

  toggleLike() {
    this.publicMetrics.like_count += this.liked ? -1 : 1;
    this.liked = !this.liked;
  }

  toggleRetweet() {
    this.publicMetrics.retweet_count += this.retweeted ? -1 : 1;
    this.retweeted = !this.retweeted;
  }

  async raiseEvent(type: "like" | "retweet" | "quote" | "reply") {
    if (type === "like") {
      if (this.liked) this.eventsBroadcaster.newTweetEvent({ type: "unlike", activatedTweet: this, done: false });
      else this.eventsBroadcaster.newTweetEvent({ type, activatedTweet: this, done: false });
      this.toggleLike();
    } 
    if (type === "retweet") {
      if (this.retweeted) this.eventsBroadcaster.newTweetEvent({ type: "unretweet", activatedTweet: this, done: false });
      else {
        const modal = await this.modalController.create({
          component: QuoteModalComponent,
          componentProps: { tweetId: this.actualTweet.id, userId: this.userId, replyType: "retweet" },
          swipeToClose: true,
          presentingElement: this.routerOutlet.parentOutlet.nativeEl
        })
        await modal.present();
        const { data } = await modal.onWillDismiss();
        if (data?.updateCounter) this.toggleRetweet();
        if (data?.success) this.eventsBroadcaster.newTweetEvent({ type: "retweet", activatedTweet: this, tweetId: this.actualTweet.id, done: true, update: data?.updateCounter });
      }
    }
    if (type === "reply") {
      const modal = await this.modalController.create({
        component: QuoteModalComponent,
        componentProps: { tweetId: this.actualTweet.id, userId: this.userId, replyType: "reply" },
        swipeToClose: true,
        presentingElement: this.routerOutlet.parentOutlet.nativeEl
      });
      await modal.present();
      const { data } = await modal.onWillDismiss();
      if (data?.success) {
        this.publicMetrics.reply_count++;
        this.eventsBroadcaster.newTweetEvent({ type: "reply", activatedTweet: this, tweetId: this.actualTweet.id, done: true });
      } 
    }
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: TweetSettingsPopoverComponent,
      event: ev,
      translucent: true,
      dismissOnSelect: true,
      componentProps: { tweet: this.actualTweet, userId: this.userId, quotedUser: this.tweet.quotedUser }
    });
    await popover.present();
  }

}
