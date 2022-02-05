import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormattedDatePipe } from 'src/app/pipes/formatted-date.pipe';
import { GetHqPicturePipe } from 'src/app/pipes/get-hq-picture.pipe';

@NgModule({
  declarations: [FormattedDatePipe, GetHqPicturePipe],
  imports: [
    CommonModule
  ],
  exports: [FormattedDatePipe, GetHqPicturePipe]
})
export class CustomPipesModule { }
