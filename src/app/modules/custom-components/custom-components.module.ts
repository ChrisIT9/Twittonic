import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TweetComponent } from 'src/app/components/tweet/tweet.component';
import { IonicModule } from '@ionic/angular';
import { CustomPipesModule } from '../custom-pipes/custom-pipes.module';
import { SettingsPopoverComponent } from 'src/app/components/settings-popover/settings-popover.component';
import { RouterModule } from '@angular/router';
import { ImageCarouselComponent } from 'src/app/components/image-carousel/image-carousel.component';


@NgModule({
  declarations: [TweetComponent, SettingsPopoverComponent, ImageCarouselComponent],
  imports: [
    CommonModule,
    IonicModule,
    CustomPipesModule,
    RouterModule
  ],
  exports: [TweetComponent, SettingsPopoverComponent, ImageCarouselComponent]
})
export class CustomComponentsModule { }
