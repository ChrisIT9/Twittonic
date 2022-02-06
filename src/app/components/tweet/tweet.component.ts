import { Component, Input, OnInit } from '@angular/core';
import { ExpandedTweet } from 'src/app/typings/Tweets';

@Component({
  selector: 'app-tweet',
  templateUrl: './tweet.component.html',
  styleUrls: ['./tweet.component.scss'],
})
export class TweetComponent implements OnInit {
  @Input() tweet: ExpandedTweet;
  constructor() { }

  ngOnInit() {}

}
