import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TweetComponent } from 'src/app/components/tweet/tweet.component';
import { IonicModule } from '@ionic/angular';
import { CustomPipesModule } from '../custom-pipes/custom-pipes.module';
import { SettingsPopoverComponent } from 'src/app/components/settings-popover/settings-popover.component';


@NgModule({
  declarations: [TweetComponent, SettingsPopoverComponent],
  imports: [
    CommonModule,
    IonicModule,
    CustomPipesModule
  ],
  exports: [TweetComponent, SettingsPopoverComponent]
})
export class CustomComponentsModule { }
