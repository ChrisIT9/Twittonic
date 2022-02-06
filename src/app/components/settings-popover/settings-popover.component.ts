import { Component, Input, OnInit } from '@angular/core';
import { EventsBroadcasterService } from 'src/app/services/events-broadcaster.service';
import { TwitterService } from 'src/app/services/twitter.service';

@Component({
  selector: 'app-settings-popover',
  templateUrl: './settings-popover.component.html',
  styleUrls: ['./settings-popover.component.scss'],
})
export class SettingsPopoverComponent implements OnInit {
  @Input() username: string;

  constructor(private twitterService: TwitterService, private eventsBroadcaster: EventsBroadcasterService) { }

  ngOnInit() {
    
  }

  async logout() {
    const observables = await this.twitterService.revokeTokens();
    let error = false;

    observables.map((observable, index, { length }) => {
      observable.subscribe({
        next: ((_: any) => {
          if (index === length - 1 && !error)
            this.eventsBroadcaster.newAuthEvent({ type: "logout", success: true });
        }).bind(this),
        error: ((error: any) => {
          error = true;
          this.eventsBroadcaster.newAuthEvent({ type: "logout", success: false, message: error })
        }).bind(this)
      })
    })
  }

}
