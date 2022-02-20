import { Component, Input, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { EventsBroadcasterService } from 'src/app/services/events-broadcaster.service';
import { TwitterService } from 'src/app/services/twitter.service';
import { ExpandedTweet, Tweet, User } from 'src/app/typings/Tweets';

@Component({
  selector: 'app-tweet-settings-popover',
  templateUrl: './tweet-settings-popover.component.html',
  styleUrls: ['./tweet-settings-popover.component.scss'],
})
export class TweetSettingsPopoverComponent implements OnInit {
  @Input() tweet: ExpandedTweet;
  @Input() userId: string;
  @Input() quotedUser: User;

  constructor(private eventsBroadcaster: EventsBroadcasterService, private twitterService: TwitterService) { }

  ngOnInit() {
  }

  deleteTweet() {
    this.twitterService.deleteTweet(this.tweet.id).subscribe({
      next: ((_: any) => {
        this.eventsBroadcaster.newTweetEvent({ type: "delete", done: true, tweetId: this.tweet.id });
      }).bind(this),
      error: ((_: any) => {
        this.eventsBroadcaster.newTweetEvent({ type: "delete", done: false });
      }).bind(this)
    })
  }

}
