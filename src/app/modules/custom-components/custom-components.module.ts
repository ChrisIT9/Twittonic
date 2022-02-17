import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TweetComponent } from 'src/app/components/tweet/tweet.component';
import { IonicModule } from '@ionic/angular';
import { CustomPipesModule } from '../custom-pipes/custom-pipes.module';
import { SettingsPopoverComponent } from 'src/app/components/settings-popover/settings-popover.component';
import { RouterModule } from '@angular/router';
import { ImageCarouselComponent } from 'src/app/components/image-carousel/image-carousel.component';
import { FormattedHtmlObjectsComponent } from 'src/app/components/formatted-html-objects/formatted-html-objects.component';
import { UserProfileComponent } from 'src/app/components/user-profile/user-profile.component';
import { FormsModule } from '@angular/forms';
import { QuoteModalComponent } from 'src/app/components/quote-modal/quote-modal.component';


@NgModule({
  declarations: [TweetComponent, SettingsPopoverComponent, ImageCarouselComponent, FormattedHtmlObjectsComponent, UserProfileComponent, QuoteModalComponent],
  imports: [
    CommonModule,
    IonicModule,
    CustomPipesModule,
    RouterModule,
    FormsModule
  ],
  exports: [TweetComponent, SettingsPopoverComponent, ImageCarouselComponent, FormattedHtmlObjectsComponent, UserProfileComponent, QuoteModalComponent]
})
export class CustomComponentsModule { }
