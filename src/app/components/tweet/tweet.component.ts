import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { TwitterService } from 'src/app/services/twitter.service';
import { ExpandedTweet } from 'src/app/typings/Tweets';
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
  @Output() tweetEvent = new EventEmitter();
  retweeted: boolean;
  
  constructor(private modalController: ModalController, private popoverController: PopoverController) { }

  ngOnInit() {
    this.retweeted = this.tweet?.referenced_tweets && this.tweet.referenced_tweets[0].type === 'retweeted';
  }

  toggleLike() {
    this.tweet.public_metrics.like_count += this.liked ? -1 : 1;
    this.liked = !this.liked;
  }

  toggleRetweet() {
    (this.tweet.retweetedTweet || this.tweet).public_metrics.retweet_count += this.retweeted ? -1 : 1;
    this.retweeted = !this.retweeted;
  }

  async raiseEvent(type: "like" | "retweet" | "quote") {
    if (type === "like") {
      if (this.liked) this.tweetEvent.emit({ type: "unlike", activatedTweet: this });
      else this.tweetEvent.emit({ type, activatedTweet: this });
      this.toggleLike();
    } 
    if (type === "retweet") {
      if (this.retweeted) this.tweetEvent.emit({ type: "unretweet", activatedTweet: this });
      else {
        const modal = await this.modalController.create({
          component: QuoteModalComponent,
          componentProps: { tweetId: (this.tweet.retweetedTweet?.id || this.tweet.id), userId: this.userId, username: this.tweet.username }
        })
        await modal.present();
        const { data } = await modal.onWillDismiss();
        if (data.updateCounter) this.toggleRetweet();
        if (data.success) this.tweetEvent.emit({ type: "retweet" });
      }
    }
  }

}
