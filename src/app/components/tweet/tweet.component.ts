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
  
  constructor(private twitterService: TwitterService) { }

  ngOnInit() {}

  toggleLike() {
    this.tweet.public_metrics.like_count += this.liked ? -1 : 1;
    this.liked = !this.liked;
  }

  raiseEvent(type: "like" | "retweet" | "quote") {
    this.tweetEvent.emit({ type, activatedTweet: this });
  }

}
