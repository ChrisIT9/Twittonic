import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { TwitterService } from 'src/app/services/twitter.service';

@Component({
  selector: 'app-quote-modal',
  templateUrl: './quote-modal.component.html',
  styleUrls: ['./quote-modal.component.scss'],
})
export class QuoteModalComponent implements OnInit {
  tweetContent: string | undefined = undefined;
  tweetSending: boolean = false;
  @Input() userId: string | number;
  @Input() tweetId: string | number;
  @Input() username: string;

  constructor(private modalController: ModalController, 
    private twitterService: TwitterService, 
    private toastController: ToastController,
  ) { }

  ngOnInit() {}

  postTweet() {
    if (this.tweetContent === undefined || !this.tweetContent.trim().length) {
      this.twitterService.retweetTweet(this.userId, this.tweetId).subscribe({
        next: ((_) => {
          this.modalController.dismiss({ success: true, updateCounter: true });
        }).bind(this),
        error: ((_) => {
          this.toastController.create({ message: "Qualcosa è andato storto", color: "danger", duration: 1000, position: "top" });
        }).bind(this)
      })
    } else {
      this.twitterService.quoteTweet(this.tweetId, this.tweetContent).subscribe({
        next: ((_) => {
          this.modalController.dismiss({ success: true, updateCounter: false });
        }).bind(this),
        error: ((_) => {
          this.toastController.create({ message: "Qualcosa è andato storto", color: "danger", duration: 1000, position: "top" });
        }).bind(this)
      })
    }
  }

}
