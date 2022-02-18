import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { EventsBroadcasterService } from 'src/app/services/events-broadcaster.service';
import { TwitterService } from 'src/app/services/twitter.service';
import { TweetEvent } from 'src/app/typings/Events';
import { ExpandedTweet, Metrics, Tweet } from 'src/app/typings/Tweets';
import { QuoteModalComponent } from '../quote-modal/quote-modal.component';

@Component({
  selector: 'app-tweet',
  templateUrl: './tweet.component.html',
  styleUrls: ['./tweet.component.scss']
})
export class TweetComponent implements OnInit {
  @Input() tweet: ExpandedTweet;
  @Input() liked: boolean;
  @Input() userId: string | number;
  retweeted: boolean;
  publicMetrics: Metrics;
  actualTweet: Tweet;
  tweetEventsObservable: Observable<TweetEvent>;
  
  constructor(private modalController: ModalController, private popoverController: PopoverController, private eventsBroadcaster: EventsBroadcasterService) { 
  }

  ngOnInit() {
    this.retweeted = this.tweet?.referenced_tweets && this.tweet.referenced_tweets[0].type === 'retweeted';

    this.tweetEventsObservable = this.eventsBroadcaster.tweetEventsObservable;

    this.tweetEventsObservable.subscribe(({ done, tweetId, type, activatedTweet }) => {
      if (done && tweetId === this.actualTweet?.id && activatedTweet !== this) {
        if (type === "like" || type === "unlike") this.publicMetrics.like_count += this.liked ? -1 : 1;
        if (type === "retweet" || type === "unretweet") this.publicMetrics.retweet_count += this.retweeted ? -1 : 1;
        if (type === "reply") this.publicMetrics.reply_count++;
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
          componentProps: { tweetId: this.actualTweet.id, userId: this.userId, replyType: "retweet" }
        })
        await modal.present();
        const { data } = await modal.onWillDismiss();
        if (data?.updateCounter) this.toggleRetweet();
        if (data?.success) this.eventsBroadcaster.newTweetEvent({ type: "retweet", activatedTweet: this, tweetId: this.actualTweet.id, done: true });
      }
    }
    if (type === "reply") {
      const modal = await this.modalController.create({
        component: QuoteModalComponent,
        componentProps: { tweetId: this.actualTweet.id, userId: this.userId, replyType: "reply" }
      });
      await modal.present();
      const { data } = await modal.onWillDismiss();
      if (data?.success) {
        this.publicMetrics.reply_count++;
        this.eventsBroadcaster.newTweetEvent({ type: "reply", activatedTweet: this, tweetId: this.actualTweet.id, done: true });
      } 
    }
  }

}
