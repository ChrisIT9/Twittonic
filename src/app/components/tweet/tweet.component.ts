import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TwitterService } from 'src/app/services/twitter.service';
import { ExpandedTweet } from 'src/app/typings/Tweets';

@Component({
  selector: 'app-tweet',
  templateUrl: './tweet.component.html',
  styleUrls: ['./tweet.component.scss']
})
export class TweetComponent implements OnInit {
  @Input() tweet: ExpandedTweet;
  @Input() liked: boolean;
  @Output() tweetEvent = new EventEmitter();
  retweeted: boolean;
  
  constructor(private twitterService: TwitterService) { }

  ngOnInit() {
    this.retweeted = this.tweet?.referenced_tweets && this.tweet.referenced_tweets[0].type === 'retweeted';
    console.log(this.tweet);
  }

  toggleLike() {
    this.tweet.public_metrics.like_count += this.liked ? -1 : 1;
    this.liked = !this.liked;
  }

  toggleRetweet() {
    this.retweeted = !this.retweeted;
  }

  raiseEvent(type: "like" | "retweet" | "quote") {
    if (type === "like") {
      if (this.liked) this.tweetEvent.emit({ type: "unlike", activatedTweet: this });
      else this.tweetEvent.emit({ type, activatedTweet: this });
      this.toggleLike();
    } 
    if (type === "retweet") {
      this.toggleRetweet();
    }
  }

}
